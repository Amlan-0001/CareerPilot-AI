import os
from app.core.logging import logger


class PromptBuilder:
    def __init__(self, prompts_dir: str = "app/ai/prompts"):
        self.prompts_dir = prompts_dir

    def load_prompt(self, template_name: str, **kwargs) -> str:
        file_path = os.path.join(self.prompts_dir, template_name)
        if not os.path.exists(file_path):
            logger.warning(f"Prompt template {file_path} not found.")
            return ""

        with open(file_path, "r", encoding="utf-8") as f:
            template = f.read()

        try:
            return template.format(**kwargs)
        except KeyError as e:
            logger.error(f"Missing key for prompt template {template_name}: {e}")
            return template


prompt_builder = PromptBuilder()
