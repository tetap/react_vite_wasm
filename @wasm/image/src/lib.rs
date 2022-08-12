use image_filter::ImageFilter;
use wasm_bindgen::prelude::*;
use web_sys::ImageData;

#[wasm_bindgen]
pub fn canvas_to_gray(image_data: ImageData) -> ImageData {
    ImageFilter::new(image_data).to_gray().to_image_data()
}

mod image_filter;
