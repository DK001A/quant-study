# factors/flags.py
import numpy as np  # 引入numpy用来做向量化判断

def round_price(x):
    return round(x + 1e-9, 2)

def limit_price(pre_close, ratio, name):
    # 精准识别每一行是否带 ST
    is_st = name.str.contains("ST", case=False, na=False)
    
    # 如果是 ST，比例变成 0.05（保留正负号）；否则用传入的 ratio
    r = np.where(is_st, 0.05 * np.sign(ratio), ratio)
    
    return round_price(pre_close * (1 + r))

def build_flags(df, ratio=0.10):
    df = df.copy()
    df["is_st"] = df["name"].str.contains("ST", case=False, na=False)
    df["is_suspended"] = df["volume"].fillna(0).eq(0)
    
    up = limit_price(df["pre_close"], ratio, df["name"])
    dn = limit_price(df["pre_close"], -ratio, df["name"])
    
    df["limit_up"] = df["close"].eq(up)
    df["limit_down"] = df["close"].eq(dn)
    
    return df