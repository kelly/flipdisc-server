import argparse
import numpy as np
import cv2
import zmq
import time
import atexit
import mediapipe as mp
from mediapipe.tasks.python import vision
# https://github.com/lavindude/GestureController/blob/b36881ee8509cb5294f9664fef86bc83e7d3d3d9/main.py#L39
# Constants
SOCKET_PATH = 'ipc:///tmp/gesture-data'
LANDMARK_LABELS = [
  'wrist'
  'thumb_cmc',
  'thumb_mcp',
  'thumb_ip',
  'thumb_tip',
  'index_finger_mcp',
  'index_finger_pip',
  'index_finger_dip',
  'index_finger_tip',
  'middle_finger_mcp',
  'middle_finger_pip',
  'middle_finger_dip',
  'middle_finger_tip',
  'ring_finger_mcp',
  'ring_finger_pip',
  'ring_finger_dip',
  'ring_finger_tip',
  'pinky_mcp',
  'pinky_pip',
  'pinky_dip',
  'pinky_tip'
];

# Parse command-line arguments
def parse_arguments():
  parser = argparse.ArgumentParser(description='Process camera frames with MediaPipe PoseLandmarker.')
  parser.add_argument('--port', type=int, default=1, help='Camera port (default: 0)')
  parser.add_argument('--width', type=int, default=28, help='Camera frame width (default: 28)')
  parser.add_argument('--height', type=int, default=14, help='Camera frame height (default: 14)')
  parser.add_argument('--hands', type=int, default=1, help='Number of hands to detect (default: 1)')
  parser.add_argument('--model', type=str, default='./resources/models/gesture_recognizer.task', help='Model file path (default: ./resources/models/gesture_recognizer.task)')
  return parser.parse_args()

# Cleanup function
def cleanup():
  socket.close()
  context.term()
  cam.release()

def to_landmark_dict(landmarks):
  landmark_dict = {}
  for idx, landmark in enumerate(landmarks):
    label = LANDMARK_LABELS[idx] if idx < len(LANDMARK_LABELS) else 'unknown'
    landmark_dict[label] = {
      'x': landmark.x,
      'y': landmark.y,
      'z': landmark.z,
      'visibility': landmark.visibility,
      'presence': landmark.presence
    }
  return landmark_dict


def send(gestures, landmarks):
  socket.send_json({
    'gesture': gestures,
    'landmarks': landmarks
  })

# Frame callback function
def frame_callback(result: mp.tasks.vision.GestureRecognizerResult, output_image: mp.Image, timestamp_ms: int):
  landmarks = []
  if (result.hand_landmarks):
    for landmark in result.hand_landmarks:
      landmarks.append(to_landmark_dict(landmark))

  gestures = []
  if (result.gestures):
    for gesture in result.gestures:
      if (gesture[0].score > 0.5):
        gestures.append(gesture[0].category_name)

  send(gestures, landmarks)
    

# Capture frame
def capture():
  ret, photo = cam.read() 
  frame_timestamp_ms = int(time.time() * 1000.0)
  photo = cv2.flip(photo, 1)
  image = mp.Image(image_format=mp.ImageFormat.SRGB, data=photo)
  detector.recognize_async(image, frame_timestamp_ms)

# Main function
def main():
    args = parse_arguments()
    global cam, width, height, socket, context, detector
    cam_port = args.port
    width = args.width
    height = args.height
    cam = cv2.VideoCapture(cam_port) 

    # Initialize ZeroMQ socket
    context = zmq.Context()
    socket = context.socket(zmq.PUB)
    socket.bind(SOCKET_PATH)

    # Create PoseLandmarker
    options = mp.tasks.vision.GestureRecognizerOptions(
      base_options=mp.tasks.BaseOptions(model_asset_path=args.model, delegate='GPU'),
      num_hands=args.hands,
      running_mode=mp.tasks.vision.RunningMode.LIVE_STREAM,
      result_callback=frame_callback)

    detector = vision.GestureRecognizer.create_from_options(options)


    # Register cleanup function
    atexit.register(cleanup)

    # Main loop
    while True:
      capture()

if __name__ == '__main__':
    main()