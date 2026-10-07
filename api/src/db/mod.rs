use crate::Result;
use crate::error::ApiError;
use js_sys::wasm_bindgen::JsValue;
use sea_query::{QueryStatementWriter, SqliteQueryBuilder, Value};
use worker::{D1Database, D1PreparedStatement};

pub fn prepare<Q: QueryStatementWriter>(db: &D1Database, query: &Q) -> Result<D1PreparedStatement> {
    let (statement, values) = query.build(SqliteQueryBuilder);
    let values = values
        .into_iter()
        .map(to_js)
        .collect::<Result<Vec<JsValue>>>()?;

    Ok(db.prepare(&statement).bind(&values)?)
}

fn to_js(value: Value) -> Result<JsValue> {
    if !value.is_some() {
        return Ok(JsValue::NULL);
    }

    match value {
        Value::Bool(Some(v)) => Ok(JsValue::from_bool(v)),
        Value::TinyInt(Some(v)) => Ok(JsValue::from_f64(f64::from(v))),
        Value::SmallInt(Some(v)) => Ok(JsValue::from_f64(f64::from(v))),
        Value::Int(Some(v)) => Ok(JsValue::from_f64(f64::from(v))),
        #[allow(
            clippy::cast_precision_loss,
            reason = "BigInt values have to be cast to f64, as i64 isnt supported by D1."
        )]
        Value::BigInt(Some(v)) => Ok(JsValue::from_f64(v as f64)),
        Value::TinyUnsigned(Some(v)) => Ok(JsValue::from_f64(f64::from(v))),
        Value::SmallUnsigned(Some(v)) => Ok(JsValue::from_f64(f64::from(v))),
        Value::Unsigned(Some(v)) => Ok(JsValue::from_f64(f64::from(v))),
        Value::Float(Some(v)) => Ok(JsValue::from_f64(f64::from(v))),
        Value::Double(Some(v)) => Ok(JsValue::from_f64(v)),
        Value::String(Some(v)) => Ok(JsValue::from_str(&v)),
        Value::Char(Some(v)) => Ok(JsValue::from_str(&v.to_string())),
        _ => Err(ApiError::Internal(format!(
            "unsupported D1 bind value: {value:?}"
        ))),
    }
}
