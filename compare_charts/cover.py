import cv2
import numpy as np


class Cover:
    def __init__(self, shape, color):
        self._image = np.zeros(shape, np.uint8)
        self._color = color
        self._drawing = False

    @property
    def drawing(self):
        return self._drawing

    @drawing.setter
    def drawing(self, is_drawing):
        self._drawing = is_drawing

    @property
    def image(self):
        return self._image

    @property
    def color(self):
        return self._color

    @staticmethod
    def draw(event, x, y, flags, param):
        if event == cv2.EVENT_LBUTTONDOWN:
            param.drawing = True
        elif event == cv2.EVENT_MOUSEMOVE:
            if param.drawing:
                param.image[:, :] = param.color
                param.image[:, :x] = 0
        elif event == cv2.EVENT_LBUTTONUP:
            param.drawing = False
