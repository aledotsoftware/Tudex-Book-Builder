"""
Data models for the Novel Weaver Studio application.
"""

import uuid

class Character:
    def __init__(self, name, description=""):
        self.id = str(uuid.uuid4())
        self.name = name
        self.description = description
        self.attributes = {}

class Chapter:
    def __init__(self, title, summary=""):
        self.id = str(uuid.uuid4())
        self.title = title
        self.summary = summary
        self.content = ""
        self.parts = []
        self.images = []

class Novel:
    def __init__(self, title, description=""):
        self.id = str(uuid.uuid4())
        self.title = title
        self.description = description
        self.characters = []
        self.chapters = []
        self.project_settings = {
            "genre": "Fantasy",
            "tone": "Adventurous",
            "illustration_style": "Watercolor"
        }
