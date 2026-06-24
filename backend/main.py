from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import math
import re

app = FastAPI(title="Yusroh Calculator API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Payload(BaseModel):
    expression: str
    angle_mode: str = "deg"


SUPPORTED_FUNCTIONS = {
    "sin": math.sin,
    "cos": math.cos,
    "tan": math.tan,
    "sqrt": math.sqrt,
    "abs": abs,
    "log": math.log,
}


def sanitize_expression(expr: str) -> str:
    expr = expr.replace("×", "*").replace("÷", "/").replace("−", "-").replace("π", "pi")
    expr = expr.replace("√", "sqrt")
    expr = expr.replace("^", "**")
    expr = expr.replace("∞", "float('inf')")
    return expr


def evaluate_expression(expression: str, angle_mode: str) -> float:
    cleaned = sanitize_expression(expression)
    cleaned = re.sub(r"\bpi\b", "math.pi", cleaned)
    cleaned = re.sub(r"\bsin\b", "math.sin", cleaned)
    cleaned = re.sub(r"\bcos\b", "math.cos", cleaned)
    cleaned = re.sub(r"\btan\b", "math.tan", cleaned)
    cleaned = re.sub(r"\bsqrt\b", "math.sqrt", cleaned)
    cleaned = re.sub(r"\blog\b", "math.log", cleaned)
    cleaned = re.sub(r"\babs\b", "abs", cleaned)
    if angle_mode == "rad":
        pass
    else:
        cleaned = re.sub(r"\b(math\.(sin|cos|tan))\(([^)]*)\)", lambda m: f"{m.group(1)}({m.group(3)} * math.pi / 180)", cleaned)
    local_scope = {"__builtins__": __builtins__, "math": math, "abs": abs}
    return eval(cleaned, {"__builtins__": {}}, local_scope)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/api/calculate")
def calculate(payload: Payload):
    try:
        if not payload.expression or not payload.expression.strip():
            raise ValueError("Expression is empty")
        result = evaluate_expression(payload.expression, payload.angle_mode)
        if math.isnan(result) or math.isinf(result):
            raise ZeroDivisionError("Result is undefined")
        formatted = f"{result:.1f}" if float(result).is_integer() else str(result)
        return {"result": formatted}
    except SyntaxError:
        raise HTTPException(status_code=400, detail="Syntax Error") from None
    except ZeroDivisionError:
        raise HTTPException(status_code=400, detail="ZeroDivisionError") from None
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from None
