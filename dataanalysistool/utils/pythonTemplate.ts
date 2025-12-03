

export const dashboardAnalysisScript = `
import pandas as pd
import numpy as np
import json
import io
from js import csv_data

try:
    # Read data
    df = pd.read_csv(io.StringIO(csv_data))
    
    # --- 1. ROBUST DATA CLEANING & TYPE INFERENCE ---
    for col in df.columns:
        if df[col].dtype == 'object':
            # Remove currency symbols and commas
            temp = df[col].astype(str).str.replace(r'[$,]', '', regex=True)
            # Attempt conversion
            numeric = pd.to_numeric(temp, errors='coerce')
            
            # Heuristic: If >90% of non-null values become numbers, accept conversion
            original_non_null = df[col].notna().sum()
            new_non_null = numeric.notna().sum()
            
            if original_non_null > 0 and (new_non_null / original_non_null) > 0.9:
                df[col] = numeric

    # --- 2. GENERATE SUMMARY STATS ---
    summary = []
    for col in df.columns:
        col_data = df[col]
        is_numeric = pd.api.types.is_numeric_dtype(col_data)
        col_type = 'number' if is_numeric else 'string'
        
        stats = {
            "name": col,
            "type": col_type,
            "count": int(len(df)),
            "missing": int(col_data.isna().sum()),
            "unique": int(col_data.nunique())
        }
        
        if is_numeric:
            desc = col_data.describe()
            stats.update({
                "mean": float(desc['mean']) if not np.isnan(desc['mean']) else None,
                "median": float(col_data.median()) if not np.isnan(col_data.median()) else None,
                "min": float(desc['min']) if not np.isnan(desc['min']) else None,
                "max": float(desc['max']) if not np.isnan(desc['max']) else None,
            })
        else:
            val_counts = col_data.value_counts().head(5)
            top_values = [{"value": str(k), "count": int(v)} for k, v in val_counts.items()]
            stats["topValues"] = top_values

        summary.append(stats)
    
    # --- 3. PREPARE OUTPUT ---
    # Replace NaN with None for valid JSON
    df_json = df.replace({np.nan: None})
    rows = df_json.to_dict(orient='records')
    
    analysis = {"shape": df.shape}
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    
    if len(numeric_cols) > 1:
        corr = df[numeric_cols].corr().replace({np.nan: None})
        analysis['correlation'] = {
            'columns': numeric_cols,
            'matrix': corr.values.tolist()
        }

    result_obj = {
        "headers": df.columns.tolist(),
        "rows": rows,
        "summary": summary,
        "analysis": analysis
    }
    
    # Serialize to JSON string to ensure safe transfer to JS
    analysis_result = json.dumps(result_obj, default=str)
    
except Exception as e:
    analysis_result = json.dumps({"error": str(e)})
`;

export const extensiveEDAScript = `
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import io
import base64
import numpy as np

# Access the CSV data passed from the app
from js import csv_data

def extensive_eda_pipeline(csv_content):
    print(">>> STARTING EXTENSIVE PYTHON EDA PIPELINE")
    print("-" * 60)
    
    # 1. Load Data
    df = pd.read_csv(io.StringIO(csv_content))
    print(f"Dataset Loaded. Shape: {df.shape}")
    
    # 2. Advanced Data Cleaning (Auto-Type Inference)
    print("\\n>>> 2. DATA CLEANING & TYPE INFERENCE")
    converted_cols = []
    for col in df.columns:
        if df[col].dtype == 'object':
            try:
                clean_series = df[col].astype(str).str.replace(r'[$,]', '', regex=True)
                numeric_series = pd.to_numeric(clean_series, errors='coerce')
                orig_count = df[col].count()
                new_count = numeric_series.count()
                if orig_count > 0 and (new_count / orig_count) > 0.90:
                    df[col] = numeric_series
                    converted_cols.append(col)
            except:
                continue
                
    if converted_cols:
        print(f"Converted columns to numeric: {converted_cols}")
    else:
        print("No string-to-numeric conversions needed.")

    print("-" * 60)
    print("\\n>>> 3. DATASET INFO")
    df.info()
    
    print("-" * 60)
    print("\\n>>> 4. STATISTICAL SUMMARY")
    print(df.describe().T)
    
    # --- PLOTTING SECTION ---
    plots = []
    
    def save_plot(title="Plot"):
        buf = io.BytesIO()
        plt.tight_layout()
        plt.savefig(buf, format='png', dpi=100, bbox_inches='tight')
        buf.seek(0)
        img_str = base64.b64encode(buf.read()).decode('utf-8')
        plots.append(img_str)
        plt.clf()
        print(f"Generated plot: {title}")

    sns.set_theme(style="whitegrid")
    numeric_df = df.select_dtypes(include=[np.number])
    cat_cols = df.select_dtypes(include=['object', 'category']).columns

    # A. Correlation Heatmap
    if len(numeric_df.columns) > 1:
        plt.figure(figsize=(10, 8))
        corr = numeric_df.corr()
        mask = np.triu(np.ones_like(corr, dtype=bool))
        sns.heatmap(corr, mask=mask, annot=True, fmt=".2f", cmap='coolwarm', 
                   linewidths=.5, cbar_kws={"shrink": .5})
        plt.title("Correlation Heatmap")
        save_plot("Correlation Heatmap")
    
    # B. Pairplot
    if len(numeric_df.columns) > 1:
        cols_to_plot = numeric_df.columns[:4]
        g = sns.pairplot(df[cols_to_plot].dropna(), height=2.5)
        g.fig.suptitle("Pairplot of Key Features", y=1.02)
        save_plot("Pairplot")

    # C. Distributions
    for col in numeric_df.columns[:3]:
        plt.figure(figsize=(8, 5))
        sns.histplot(df[col].dropna(), kde=True, color='teal')
        plt.title(f"Distribution of {col}")
        save_plot(f"Hist: {col}")

    # D. Boxplots
    for col in numeric_df.columns[:3]:
        plt.figure(figsize=(8, 4))
        sns.boxplot(x=df[col], color='salmon')
        plt.title(f"Boxplot: {col}")
        save_plot(f"Box: {col}")

    # E. Violin Plots (Advanced)
    print("\\n>>> 5. GENERATING VIOLIN PLOTS")
    if len(numeric_df.columns) > 0 and len(cat_cols) > 0:
        target_num = numeric_df.columns[0]
        target_cat = cat_cols[0]
        if df[target_cat].nunique() <= 10:
            plt.figure(figsize=(10, 6))
            sns.violinplot(data=df, x=target_cat, y=target_num, palette="muted")
            plt.title(f"Violin Plot: {target_num} by {target_cat}")
            plt.xticks(rotation=45)
            save_plot(f"Violin: {target_num} by {target_cat}")

    # F. Swarm Plots (Advanced)
    print("\\n>>> 6. GENERATING SWARM PLOTS")
    if len(numeric_df.columns) > 0 and len(cat_cols) > 0:
        target_num = numeric_df.columns[0]
        target_cat = cat_cols[0]
        if df[target_cat].nunique() <= 8:
            # Sample to prevent browser lag
            sample_size = min(500, len(df))
            sample_df = df.sample(n=sample_size, random_state=42)
            plt.figure(figsize=(10, 6))
            sns.swarmplot(data=sample_df, x=target_cat, y=target_num, size=4, palette="deep")
            plt.title(f"Swarm Plot (Sampled n={sample_size}): {target_num} by {target_cat}")
            plt.xticks(rotation=45)
            save_plot(f"Swarm: {target_num} by {target_cat}")

    # G. Facet Grid (Advanced)
    print("\\n>>> 7. GENERATING FACET GRID")
    if len(numeric_df.columns) >= 2 and len(cat_cols) >= 1:
        target_cat = cat_cols[0]
        x_num = numeric_df.columns[0]
        y_num = numeric_df.columns[1]
        if df[target_cat].nunique() <= 6:
            g = sns.FacetGrid(df, col=target_cat, col_wrap=3, height=4)
            g.map(sns.scatterplot, x_num, y_num, alpha=0.7)
            g.fig.subplots_adjust(top=0.9)
            g.fig.suptitle(f"Facet Grid: {x_num} vs {y_num} split by {target_cat}")
            buf = io.BytesIO()
            g.savefig(buf, format='png', dpi=100, bbox_inches='tight')
            buf.seek(0)
            img_str = base64.b64encode(buf.read()).decode('utf-8')
            plots.append(img_str)
            plt.clf()
            print(f"Generated Facet Grid")

    return plots

# Execute Pipeline
generated_plots = extensive_eda_pipeline(csv_data)
`;
