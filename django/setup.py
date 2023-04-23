from setuptools import find_packages, setup

setup(
    author="Keith Moss",
    author_email="keithamoss@gmail.com",
    description="Mapa",
    license="GPL3",
    keywords="",
    url="https://github.com/keithamoss/mapa",
    name="mapa",
    version="0.1.0",
    packages=find_packages(exclude=["*.tests", "*.tests.*", "tests.*", "tests"]),
)
