import toga
from toga.style import Pack
from toga.style.pack import COLUMN, ROW
from generator import generate_novel

class NovelWeaverAI(toga.App):
    def startup(self):
        main_box = toga.Box(style=Pack(direction=COLUMN))

        name_label = toga.Label(
            "Título de la Novela: ",
            style=Pack(padding=(0, 5))
        )
        self.name_input = toga.TextInput(style=Pack(flex=1))

        name_box = toga.Box(style=Pack(direction=ROW, padding=5))
        name_box.add(name_label)
        name_box.add(self.name_input)

        button = toga.Button(
            "Generar Novela",
            on_press=self.handle_generate_novel,
            style=Pack(padding=5)
        )

        main_box.add(name_box)
        main_box.add(button)

        self.main_window = toga.MainWindow(title=self.formal_name)
        self.main_window.content = main_box
        self.main_window.show()

    def handle_generate_novel(self, widget):
        if self.name_input.value:
            generate_novel(self.name_input.value)
            self.main_window.info_dialog("Éxito", "¡Novela generada con éxito!")
        else:
            self.main_window.error_dialog("Error", "Por favor, introduce un título para la novela.")

def main():
    return NovelWeaverAI('Novel Weaver AI', 'org.example.novelweaverai')

if __name__ == '__main__':
    main().main_loop()
