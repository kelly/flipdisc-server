import argparse
import numpy as np
import cv2
import zmq
import time
import atexit
import mediapipe as mp
import platform
import signal
from mediapipe.tasks.python import vision
from skimage.transform import resize
from skimage import img_as_float64

# https://github.com/lavindude/GestureController/blob/b36881ee8509cb5294f9664fef86bc83e7d3d3d9/main.py#L39
# Constants
BG_COLOR = (0, 0, 0) # black
MASK_COLOR = (255, 255, 255) # white
SOCKET_PATH = 'ipc:///tmp/pose-data'
LANDMARK_LABELS = [
  'nose',
  'left_eye_inner',
  'left_eye',
  'left_eye_outer',
  'right_eye_inner',
  'right_eye',
  'right_eye_outer',
  'left_ear',
  'right_ear',
  'mouth_left',
  'mouth_right',
  'left_shoulder',
  'right_shoulder',
  'left_elbow',
  'right_elbow',
  'left_wrist',
  'right_wrist',
  'left_pinky',
  'right_pinky',
  'left_index',
  'right_index',
  'left_thumb',
  'right_thumb',
  'left_hip',
  'right_hip',
  'left_knee',
  'right_knee',
  'left_ankle',
  'right_ankle',
  'left_heel',
  'right_heel',
  'left_foot_index',
  'right_foot_index'
];


# Parse command-line arguments
def parse_arguments():
  parser = argparse.ArgumentParser(description='Process camera frames with MediaPipe PoseLandmarker.')
  parser.add_argument('--device', type=str, default='/dev/video0', help='Camera port (default: /dev/video0)')
  parser.add_argument('--port', type=int,  help='Camera port (default: 0')
  parser.add_argument('--width', type=int, default=28, help='Camera frame width (default: 28)')
  parser.add_argument('--height', type=int, default=14, help='Camera frame height (default: 14)')
  parser.add_argument('--model', type=str, default='./resources/models/pose_landmarker_lite.task', help='Model file path (default: ./resources/models/pose_landmarker_lite.task)')
  return parser.parse_args()

# Cleanup function
def cleanup():
  socket.close()
  context.term()
  cam.release()

def to_landmark_dict(landmarks):
  landmark_dict = {}
  for idx, landmark in enumerate(landmarks):
    label = LANDMARK_LABELS[idx]
    landmark_dict[label] = {
      'x': landmark.x,
      'y': landmark.y,
      'z': landmark.z,
      'visibility': landmark.visibility,
      'presence': landmark.presence
      }
  return landmark_dict

def array_to_image_data(array):
  array = np.array(array)
  array = np.stack([array]*4, axis=-1)
  array[:, :, 3] = 255
  image_data = array.flatten()
  
  return image_data

# Convert image to ImageData format
def mask_to_image_data(mask_view, output_image):
  fg_image = np.full_like(output_image, MASK_COLOR, dtype=np.uint8)
  bg_image = np.full_like(output_image, BG_COLOR, dtype=np.uint8)
  condition = np.stack((mask_view,) * 3, axis=-1) > 0.3
  output_image = np.where(condition, fg_image, bg_image)

  if output_image.shape[-1] == 3:  # RGB image
      output_image = np.concatenate([output_image, np.ones((*output_image.shape[:-1], 1), dtype=output_image.dtype) * 255], axis=-1)
  elif output_image.shape[-1] != 4:  # Not RGBA or RGB
      raise ValueError("Input image must be in RGBA or RGB format")
  
  return output_image.flatten()

# Resize image and send
def send(image, landmarks=None):
  socket.send_json({
    'image': image.tolist(),
    'landmarks': landmarks
  })

# Frame callback function
def frame_callback(result, output_image, timestamp_ms):
  mask = result.segmentation_masks[0] if result.segmentation_masks else None
  if mask:
    mask_view = cv2.resize(mask.numpy_view(), (width, height))
    output_image = cv2.resize(output_image.numpy_view(), (width, height))
    image = mask_to_image_data(mask_view, output_image) if isinstance(mask_view[0][0], np.float32) else array_to_image_data(mask_view)
    landmarks = to_landmark_dict(result.pose_landmarks[0]) 
    send(image, landmarks)

# Capture frame
def capture():
  ret, photo = cam.read() 
  frame_timestamp_ms = int(time.time() * 1000.0)
  photo = cv2.flip(photo, 1)
  photo = cv2.resize(photo, (320, 240))
  image = mp.Image(image_format=mp.ImageFormat.SRGB, data=photo)
  result = detector.detect_async(image, frame_timestamp_ms)

def signal_handler(sig, frame):
  cleanup()
  exit(0)

# Main function
def main():
  args = parse_arguments()
  global cam, width, height, socket, context, detector
  cam_port = args.port if args.port else args.device
  width = args.width
  height = args.height
  cam = cv2.VideoCapture(cam_port) 

  # Initialize ZeroMQ socket
  context = zmq.Context()
  socket = context.socket(zmq.PUB)
  socket.bind(SOCKET_PATH)

  delegate = mp.tasks.BaseOptions.Delegate.CPU if platform.system() == 'Darwin' else mp.tasks.BaseOptions.Delegate.GPU


  # Create PoseLandmarker
  base_options = mp.tasks.BaseOptions(model_asset_path=args.model, delegate=delegate)
  options = vision.PoseLandmarkerOptions(
    base_options=base_options,
    running_mode=mp.tasks.vision.RunningMode.LIVE_STREAM,
    output_segmentation_masks=True,
    result_callback=frame_callback)
  detector = vision.PoseLandmarker.create_from_options(options)

  # Register cleanup function
  atexit.register(cleanup)
  signal.signal(signal.SIGINT, signal_handler)
  signal.signal(signal.SIGTERM, signal_handler)

  # Main loop
  try:
    while cam.isOpened():
      capture()
  except Exception as e:
    cleanup()

if __name__ == '__main__':
  main()