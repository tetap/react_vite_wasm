use image::{DynamicImage, GenericImage, GenericImageView, ImageBuffer};
use wasm_bindgen::Clamped;
use web_sys::ImageData;

pub struct ImageFilter {
    image_mut: DynamicImage,
}

impl ImageFilter {
    pub fn new(data: ImageData) -> ImageFilter {
        let width = data.width();
        let height = data.height();
        let raw_pixels = data.data().to_vec();
        let img_buffer = ImageBuffer::from_vec(width, height, raw_pixels).unwrap();
        let image = DynamicImage::ImageRgba8(img_buffer);
        ImageFilter { image_mut: image }
    }
    pub fn to_gray(&self) -> ImageFilter {
        let mut last_mut = self.image_mut.clone();
        let width = last_mut.width();
        let height = last_mut.height();
        for x in 0..width {
            for y in 0..height {
                let pixel = self.image_mut.get_pixel(x, y);
                let r = pixel[0] as f32;
                let g = pixel[1] as f32;
                let b = pixel[2] as f32;
                let a = pixel[3];
                let gray = (r * 0.3 + g * 0.59 + b * 0.11) as u8;
                let new_pixel = image::Rgba([gray, gray, gray, a]);
                last_mut.put_pixel(x, y, new_pixel)
            }
        }
        ImageFilter {
            image_mut: last_mut,
        }
    }

    pub fn to_image_data(&self) -> ImageData {
        ImageData::new_with_u8_clamped_array_and_sh(
            Clamped(&mut self.image_mut.to_rgba8()),
            self.image_mut.width(),
            self.image_mut.height(),
        )
        .unwrap()
    }
}
