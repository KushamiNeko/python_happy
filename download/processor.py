import subprocess
import os
from abc import ABCMeta, abstractmethod
from typing import Iterable, cast
from fun.utils import pretty, colors


class Processor(metaclass=ABCMeta):
    def __init__(self) -> None:
        self._src = os.path.join(cast(str, os.getenv("HOME")), "Downloads")
        self._tar = os.path.join(
            cast(str, os.getenv("HOME")), "Documents", "data_source"
        )

        assert os.path.exists(self._src)
        assert os.path.exists(self._tar)

    @abstractmethod
    def _urls(self) -> Iterable[str]:
        raise NotImplementedError

    def download(self) -> None:
        count = 0
        for url in self._urls():
            subprocess.Popen(["google-chrome", url])
            count += 1

        pretty.color_print(
            colors.PAPER_LIME_300, f"{count} files opened",
        )

        pretty.color_input(
            colors.PAPER_BLUE_300,
            "download completed, press any key to rename and move the files",
        )

    @abstractmethod
    def rename(self) -> None:
        raise NotImplementedError

    @abstractmethod
    def check(self) -> None:
        raise NotImplementedError
