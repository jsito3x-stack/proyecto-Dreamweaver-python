"""
Paquete editor - Módulo principal del editor Dreamweaver Python
"""

from .core import EditorCore
from .routes import create_app

__version__ = '1.0.0'
__all__ = ['EditorCore', 'create_app']
