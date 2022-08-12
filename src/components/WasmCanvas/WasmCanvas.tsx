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
