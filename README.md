rsw安装参照官方文档即可，非常详细简单。直入正题。

https://github.com/rwasm/vite-plugin-rsw

rust安装image依赖

https://docs.rs/image/0.24.3/image

https://github.com/image-rs/image

编写简单的滤镜处理mod
```
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
```

在lib.rs中使用

```
use image_filter::ImageFilter;
use wasm_bindgen::prelude::*;
use web_sys::ImageData;

#[wasm_bindgen]
pub fn canvas_to_gray(image_data: ImageData) -> ImageData {
    ImageFilter::new(image_data).to_gray().to_image_data()
}

mod image_filter;
```

编写组件

```
import React, { createRef, useEffect } from 'react'
import init, { canvas_to_gray } from '@wasm/image'
import style from './WasmCanvas.module.scss'
import filterimage from '@/assets/wallhaven-wqve97.png'
import type { RefObject } from 'react'

function scaleImage(image: HTMLImageElement, maxSize: number) {
  let width = image.width
  let height = image.height
  const p = width / height
  if (width > maxSize || height > maxSize) {
    if (width > height) {
      width = maxSize
      height = width / p
    } else {
      height = maxSize
      width = height * p
    }
  }
  return { width, height }
}

function createCanvas(canvasRef: RefObject<HTMLCanvasElement>) {
  const { current: canvas } = canvasRef
  if (!canvas) throw new Error('Canvas ref is null')
  const image = new Image()
  image.onload = () => {
    const { width, height } = scaleImage(image, 1000)
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(image, 0, 0, width, height)
    to_gray(ctx, canvas)
  }
  image.src = filterimage
}

let isInit = false
async function initWasm() {
  if (!isInit) {
    isInit = true
    await init()
  }
}

async function to_gray(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
  await initWasm()
  const { width, height } = canvas
  const imageData = ctx.getImageData(0, 0, width, height)
  // 计算函数运行时间
  console.time('canvas_to_gray time')
  const grayImageData = canvas_to_gray(imageData)
  console.timeEnd('canvas_to_gray time')
  ctx.putImageData(grayImageData, 0, 0)
}

export default function WasmCanvas() {
  const canvasRef = createRef<HTMLCanvasElement>()

  useEffect(() => {
    createCanvas(canvasRef)
  }, [])
  return <canvas className={style.wasm_canvas} ref={canvasRef} />
}
```

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/37f8bc9f5adb40f1a21a03c103cebe39~tplv-k3u1fbpfcp-watermark.image?)
