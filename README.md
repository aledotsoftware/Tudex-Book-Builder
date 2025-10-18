#  Novel Weaver AI 📖✨

<p align="center">
  <img src="https://i.imgur.com/b3_10.png" alt="Novel Weaver AI Banner" width="600"/>
</p>

<p align="center">
  <strong>An AI-powered tool to generate complete, illustrated novels from a single title.</strong>
  <br>
  For writers, artists, and anyone with a story to tell.
</p>

---

## **🌟 Overview**

Novel Weaver AI leverages the power of the **Google Gemini** model to bring your story ideas to life. Just provide a title, and the script will generate a rich, structured novel complete with:

-   **🤖 A compelling plot and description.**
-   **👨‍👩‍👧‍👦 A cast of unique characters.**
-   **📚 A full narrative, broken down into chapters and parts.**
-   **🎨 Beautiful storyboard images in a consistent artistic style.**

Everything is automatically organized into a clean folder structure, ready for you to read, edit, or build upon.

---

## **🚀 Getting Started**

Follow these steps to generate your first novel.

### **1. Prerequisites**

Before you begin, make sure you have Python installed on your system. This project requires **Python 3.7+**.

-   **Check your Python version:**
    Open a terminal or command prompt and run:
    ```bash
    python --version
    # If that doesn't work, try:
    python3 --version
    ```
-   **No Python?**
    If you don't have Python installed, download it from the [official Python website](https://www.python.org/downloads/).

### **2. Set Up Your API Key**

This script requires a Google Generative AI API key.

-   **Get your key:**
    You can obtain one from the [Google AI for Developers](https://ai.google.dev/) website.
-   **Set it as an environment variable:**
    To keep your key secure, **do not** hardcode it into the script. Instead, set it as an environment variable named `GOOGLE_API_KEY`.

    -   **macOS/Linux:**
        ```bash
        export GOOGLE_API_KEY="YOUR_API_KEY_HERE"
        ```
        *(To make this permanent, add the line to your `.bashrc`, `.zshrc`, or shell configuration file.)*

    -   **Windows (Command Prompt):**
        ```bash
        set GOOGLE_API_KEY="YOUR_API_KEY_HERE"
        ```

    -   **Windows (PowerShell):**
        ```powershell
        $Env:GOOGLE_API_KEY="YOUR_API_KEY_HERE"
        ```

### **3. Install Dependencies**

This project relies on the `google-generativeai` library. Install it using pip:
```bash
pip install google-generativeai
# Or, if you use python3:
python3 -m pip install google-generativeai
```

### **4. Run the Script**

You're all set! Run the script from your terminal with your desired novel title:
```bash
python main.py "The Enchanted Island of Brench"
```
> **Tip:** Remember to enclose titles with spaces in quotes.

The script will create a new folder with the current date and your novel's title, containing all the generated files.

---

## **📁 Folder Structure**

Here’s what the output looks like:
```
YYYY-MM-DD - your_novel_title/
├── novela_base.json
├── novela_completa.json
├── novela_completa.txt
├── 01-chapter_one/
│   ├── parte_1.txt
│   └── imagenes/
│       ├── imagen_1.png
│       └── ...
└── ...
```

---

## **🤔 Troubleshooting**

Here are solutions to common issues:

-   **`Error: python: command not found`**
    This means the `python` command isn't recognized. Try using `python3` instead. If neither works, you may need to [install Python](https://www.python.org/downloads/) or add it to your system's PATH.

-   **`Error: No GOOGLE_API_KEY found in environment variables.`**
    The script couldn't find your API key. Make sure you have set the `GOOGLE_API_KEY` environment variable correctly for your operating system (see Step 2).

-   **`pip: command not found`**
    This can happen on some systems. Try running `python -m pip` or `python3 -m pip` instead.

---

## **✍️ Author**

This script was designed to automate novel creation and inspire creativity. If you have ideas for improvements, feel free to contribute!
