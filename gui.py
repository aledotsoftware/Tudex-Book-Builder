import toga
from toga.style import Pack
from toga.style.pack import COLUMN, ROW

class NovelWeaverStudio(toga.App):
    def startup(self):
        # Create the main containers
        self.main_box = toga.Box(style=Pack(direction=COLUMN))

        # Left Column (Navigation)
        left_container = toga.Box(style=Pack(direction=COLUMN, padding=5))
        left_container.add(toga.Label("Navegación y Estructura"))

        # Right Column (Contextual Tools)
        right_container = toga.Box(style=Pack(direction=COLUMN, padding=5))
        right_container.add(toga.Label("Catálogos y Herramientas"))

        # Center Column (Main Editor)
        center_container = toga.Box(style=Pack(direction=COLUMN, padding=5))
        center_container.add(toga.Label("Editor Principal"))

        # Create SplitContainers for the three-column layout
        right_split = toga.SplitContainer(content=[center_container, right_container])
        main_split = toga.SplitContainer(content=[left_container, right_split])

        # Add the main layout to the window
        self.main_window = toga.MainWindow(title=self.formal_name)
        self.main_window.content = main_split
        self.main_window.show()

def main():
    return NovelWeaverStudio('Novel Weaver Studio', 'org.example.novelweaverstudio')

if __name__ == '__main__':
    main().main_loop()
