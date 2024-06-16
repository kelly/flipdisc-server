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

# https://github.com/lavindude/GestureController/blob/b36881ee8509cb5294f9664fef86bc83e7d3d3d9/main.py#L39
# Constants
BG_COLOR = (0, 0, 0) # black
MASK_COLOR = (255, 255, 255) # white
SOCKET_PATH = 'ipc:///tmp/segmentation-data'

# Parse command-line arguments
def parse_arguments():
  parser = argparse.ArgumentParser(description='Process camera frames with MediaPipe PoseLandmarker.')
  parser.add_argument('--device', type=str, default='/dev/video0', help='Camera port (default: /dev/video0)')
  parser.add_argument('--port', type=int,  help='Camera port (default: 0')
  parser.add_argument('--width', type=int, default=28, help='Camera frame width (default: 28)')
  parser.add_argument('--height', type=int, default=14, help='Camera frame height (default: 14)')
  parser.add_argument('--model', type=str, default='./resources/models/selfie_segmenter_landscape.tflite', help='Model file path (default: ./resources/models/selfie_segmenter_landscape.tflite)')
  return parser.parse_args()

# Cleanup function
def cleanup():
  socket.close()
  context.term()
  cam.release()


# Convert image to ImageData format
def to_image_data(numpy_image):
  if numpy_image.shape[-1] == 3:  # RGB image
      numpy_image = np.concatenate([numpy_image, np.ones((*numpy_image.shape[:-1], 1), dtype=numpy_image.dtype) * 255], axis=-1)
  elif numpy_image.shape[-1] != 4:  # Not RGBA or RGB
      raise ValueError("Input image must be in RGBA or RGB format")
  return numpy_image.flatten().tolist()

# Resize image and send
def resize_and_send(image):
  img = cv2.resize(image, (width, height))
  socket.send_json({
    'image': to_image_data(img)
  })

# Frame callback function
def frame_callback(result, output_image, timestamp_ms):
  category_mask = result.confidence_masks[0] if result.confidence_masks else None
  if category_mask:
    fg_image = np.full_like(output_image.numpy_view(), MASK_COLOR, dtype=np.uint8)
    bg_image = np.full_like(output_image.numpy_view(), BG_COLOR, dtype=np.uint8)
    condition = np.stack((category_mask.numpy_view(),) * 3, axis=-1) > 0.3
    output_image = np.where(condition, fg_image, bg_image)
    resize_and_send(output_image)

# Capture frame
def capture():
  ret, photo = cam.read() 
  frame_timestamp_ms = int(time.time() * 1000.0)
  image_format = mp.ImageFormat.SRGBA if platform.system() == 'Darwin' else mp.ImageFormat.SRGB
  color_format = cv2.COLOR_BGR2RGBA if platform.system() == 'Darwin' else cv2.COLOR_BGR2RGB
  image = mp.Image(image_format=image_format, data=cv2.cvtColor(photo, color_format))
  result = segmenter.segment_async(image, frame_timestamp_ms)

def signal_handler(sig, frame):
  cleanup()
  exit(0)

# Main function
def main():
  args = parse_arguments()
  global cam, width, height, socket, context, segmenter
  cam_port = args.port if args.port else args.device
  width = args.width
  height = args.height
  cam = cv2.VideoCapture(cam_port) 

  # Initialize ZeroMQ socket
  context = zmq.Context()
  socket = context.socket(zmq.PUB)
  socket.bind(SOCKET_PATH)

  # Create PoseLandmarker
  base_options = mp.tasks.BaseOptions(model_asset_path=args.model, delegate=mp.tasks.BaseOptions.Delegate.GPU)
  options = vision.ImageSegmenterOptions(
    base_options=base_options,
    running_mode=mp.tasks.vision.RunningMode.LIVE_STREAM,
    result_callback=frame_callback)
  segmenter = vision.ImageSegmenter.create_from_options(options)

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
