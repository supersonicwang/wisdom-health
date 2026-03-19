"""
简单的模型微调示例脚本
使用 Hugging Face Transformers + PEFT (LoRA)
"""

import torch
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    TrainingArguments,
    Trainer,
    DataCollatorForSeq2Seq
)
from peft import LoraConfig, get_peft_model, TaskType
from datasets import load_dataset
import os

# 配置
MODEL_NAME = "Qwen/Qwen2-7B-Instruct"  # 可替换为其他模型
OUTPUT_DIR = "../models/qwen2-finetuned"
DATASET_PATH = "../datasets/train_data.jsonl"

# LoRA 配置
lora_config = LoraConfig(
    task_type=TaskType.CAUSAL_LM,
    r=8,  # LoRA 秩
    lora_alpha=16,
    lora_dropout=0.05,
    target_modules=["q_proj", "v_proj", "k_proj", "o_proj"],  # 根据模型调整
    bias="none"
)

# 训练参数
training_args = TrainingArguments(
    output_dir=OUTPUT_DIR,
    num_train_epochs=3,
    per_device_train_batch_size=2,
    gradient_accumulation_steps=4,
    learning_rate=5e-5,
    fp16=True,  # Mac 用户改为 bf16=True
    logging_steps=10,
    save_steps=500,
    save_total_limit=3,
    warmup_ratio=0.1,
    lr_scheduler_type="cosine",
    gradient_checkpointing=True,
)

def prepare_data(dataset_path):
    """准备训练数据"""
    dataset = load_dataset('json', data_files=dataset_path)

    def format_instruction(example):
        """格式化为指令格式"""
        if "messages" in example:
            # 对话格式
            messages = example["messages"]
            text = ""
            for msg in messages:
                role = msg["role"]
                content = msg["content"]
                text += f"<|{role}|>\n{content}\n"
            return {"text": text}
        elif "instruction" in example:
            # 指令格式
            instruction = example["instruction"]
            input_text = example.get("input", "")
            output = example["output"]
            text = f"Instruction: {instruction}\n"
            if input_text:
                text += f"Input: {input_text}\n"
            text += f"Output: {output}"
            return {"text": text}
        return example

    dataset = dataset.map(format_instruction)
    return dataset

def main():
    print("🚀 开始加载模型和分词器...")

    # 加载分词器
    tokenizer = AutoTokenizer.from_pretrained(
        MODEL_NAME,
        trust_remote_code=True,
        padding_side="right"
    )

    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    # 加载基础模型
    model = AutoModelForCausalLM.from_pretrained(
        MODEL_NAME,
        trust_remote_code=True,
        torch_dtype=torch.float16,  # Mac 用户改为 torch.bfloat16
        device_map="auto"
    )

    # 应用 LoRA
    print("📦 应用 LoRA 配置...")
    model = get_peft_model(model, lora_config)
    model.print_trainable_parameters()

    # 准备数据
    print("📂 加载数据集...")
    if not os.path.exists(DATASET_PATH):
        print(f"❌ 数据集不存在: {DATASET_PATH}")
        print("请将训练数据放在 datasets/ 文件夹中")
        return

    dataset = prepare_data(DATASET_PATH)

    # 数据预处理
    def tokenize_function(examples):
        return tokenizer(
            examples["text"],
            truncation=True,
            max_length=2048,
            padding="max_length"
        )

    tokenized_dataset = dataset.map(
        tokenize_function,
        batched=True,
        remove_columns=dataset["train"].column_names
    )

    # 数据整理器
    data_collator = DataCollatorForSeq2Seq(
        tokenizer=tokenizer,
        model=model,
        padding=True
    )

    # 创建训练器
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=tokenized_dataset["train"],
        data_collator=data_collator,
    )

    # 开始训练
    print("🎯 开始训练...")
    trainer.train()

    # 保存模型
    print("💾 保存模型...")
    trainer.save_model(OUTPUT_DIR)
    tokenizer.save_pretrained(OUTPUT_DIR)

    print(f"✅ 训练完成！模型已保存到 {OUTPUT_DIR}")

if __name__ == "__main__":
    main()
