"""
AeroDristi - SegFormer Fine-tuning Pipeline
-------------------------------------------
This script provides the blueprint for fine-tuning a HuggingFace SegFormer model
on your custom drone/cadastral dataset (e.g. SpaceNet, xBD, or custom annotations).

To run this, you will need to install:
pip install transformers datasets evaluate torch torchvision accelerate

Usage:
1. Place your images in `data/images/` and your masks in `data/masks/`
2. Run this script in Google Colab (with a GPU) or a local machine with CUDA.
"""

import os
import torch
import numpy as np
from datasets import Dataset, DatasetDict, Image
from transformers import SegformerFeatureExtractor, SegformerForSemanticSegmentation, TrainingArguments, Trainer
import evaluate

# ---------------------------------------------------------
# 1. Configuration & Setup
# ---------------------------------------------------------
MODEL_CHECKPOINT = "nvidia/segformer-b0-finetuned-ade-512-512"
DATA_DIR = "./data" # Ensure this directory has 'images' and 'masks' folders
OUTPUT_DIR = "./aerodristi-segformer-v1"
BATCH_SIZE = 4
EPOCHS = 50

# Map your mask colors/pixel values to class IDs (0 = Background, 1 = Building, 2 = Road, etc.)
id2label = {0: "Background", 1: "Building"}
label2id = {v: k for k, v in id2label.items()}
num_labels = len(id2label)

# ---------------------------------------------------------
# 2. Prepare Dataset
# ---------------------------------------------------------
def load_custom_dataset():
    # Helper to load images and masks into HuggingFace Dataset format
    image_paths = sorted([os.path.join(DATA_DIR, 'images', f) for f in os.listdir(os.path.join(DATA_DIR, 'images')) if f.endswith('.jpg') or f.endswith('.png')])
    mask_paths = sorted([os.path.join(DATA_DIR, 'masks', f) for f in os.listdir(os.path.join(DATA_DIR, 'masks')) if f.endswith('.png')])
    
    dataset = Dataset.from_dict({
        "pixel_values": image_paths,
        "label": mask_paths,
    })
    
    # Cast columns to Image type so HF knows how to handle them
    dataset = dataset.cast_column("pixel_values", Image())
    dataset = dataset.cast_column("label", Image())
    
    # Split into train/test (80/20)
    dataset = dataset.train_test_split(test_size=0.2)
    return dataset

# ---------------------------------------------------------
# 3. Preprocessing
# ---------------------------------------------------------
feature_extractor = SegformerFeatureExtractor.from_pretrained(MODEL_CHECKPOINT)

def preprocess_function(examples):
    # SegFormer requires specifically normalized pixel values
    inputs = feature_extractor(
        [x.convert("RGB") for x in examples["pixel_values"]], 
        segmentation_maps=[x for x in examples["label"]], 
        return_tensors="pt"
    )
    return inputs

# ---------------------------------------------------------
# 4. Metrics & Evaluation
# ---------------------------------------------------------
metric = evaluate.load("mean_iou")

def compute_metrics(eval_pred):
    with torch.no_grad():
        logits, labels = eval_pred
        logits_tensor = torch.from_numpy(logits)
        # Scale logits to mask size
        logits_tensor = torch.nn.functional.interpolate(
            logits_tensor,
            size=labels.shape[-2:],
            mode="bilinear",
            align_corners=False,
        ).argmax(dim=1)
        
        pred_labels = logits_tensor.detach().cpu().numpy()
        metrics = metric.compute(
            predictions=pred_labels,
            references=labels,
            num_labels=num_labels,
            ignore_index=255,
            reduce_labels=False,
        )
        return {"mean_iou": metrics["mean_iou"], "mean_accuracy": metrics["mean_accuracy"]}

# ---------------------------------------------------------
# 5. Training Loop
# ---------------------------------------------------------
def main():
    print("Loading Dataset...")
    dataset = load_custom_dataset()
    
    # Apply preprocessing on the fly
    train_dataset = dataset["train"].with_transform(preprocess_function)
    test_dataset = dataset["test"].with_transform(preprocess_function)
    
    print("Loading Pretrained Model...")
    model = SegformerForSemanticSegmentation.from_pretrained(
        MODEL_CHECKPOINT,
        num_labels=num_labels,
        id2label=id2label,
        label2id=label2id,
        ignore_mismatched_sizes=True # Crucial when changing the number of classes
    )
    
    training_args = TrainingArguments(
        output_dir=OUTPUT_DIR,
        learning_rate=6e-5,
        num_train_epochs=EPOCHS,
        per_device_train_batch_size=BATCH_SIZE,
        per_device_eval_batch_size=BATCH_SIZE,
        save_total_limit=3,
        evaluation_strategy="steps",
        save_strategy="steps",
        save_steps=50,
        eval_steps=50,
        logging_steps=10,
        eval_accumulation_steps=5,
        remove_unused_columns=False,
        push_to_hub=False,
    )
    
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        eval_dataset=test_dataset,
        compute_metrics=compute_metrics,
    )
    
    print("Beginning Fine-Tuning...")
    trainer.train()
    
    print(f"Training Complete! Saving model to {OUTPUT_DIR}")
    trainer.save_model(OUTPUT_DIR)
    feature_extractor.save_pretrained(OUTPUT_DIR)

if __name__ == "__main__":
    # Ensure you are running this in an environment with GPU support!
    main()
