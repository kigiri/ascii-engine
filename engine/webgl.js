const vertexShaderSource = `#version 300 es

in vec2 a_position;
in vec2 a_glyph;
in float a_color;
uniform vec2 u_resolution;
out vec2 v_glyph;
out float v_color;

void main() {
  gl_Position = vec4((a_position / u_resolution * 2.0 - 1.0) * vec2(1, -1), 0, 1);
  v_glyph = a_glyph;
  v_color = a_color;
}`

const fragmentShaderSource = `#version 300 es
precision mediump float;

uniform sampler2D u_image;
in vec2 v_glyph;
in float v_color;
out vec4 outColor;

vec4 unpackColor(float f) {
  vec4 color;
  color.r = floor(f / 65536.0);
  color.g = floor((f - color.r * 65536.0) / 256.0);
  color.b = floor(f - color.r * 65536.0 - color.g * 256.0);
  color.a = 256.0;
  return color / 256.0;
}

void main() {
  outColor = texture(u_image, v_glyph) * unpackColor(v_color);
}`

const createShader = type => (gl, source) => {
  const shader = gl.createShader(gl[type])
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
  if (success) return shader

  console.warn(`failed to create ${type}`, gl.getShaderInfoLog(shader))
  gl.deleteShader(shader)
}

createShader.vertex = createShader('VERTEX_SHADER')
createShader.fragment = createShader('FRAGMENT_SHADER')

const initProgram = gl => {
  const vertexShader = createShader.vertex(gl, vertexShaderSource)
  const fragmentShader = createShader.fragment(gl, fragmentShaderSource)
  const program = gl.createProgram()
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)
  if (gl.getProgramParameter(program, gl.LINK_STATUS)) return program

  console.warn(`failed to link shaders`, gl.getProgramInfoLog(program))
  gl.deleteProgram(program)
}

export const initWebGL = (canvas, font, max) => {
  const premultipliedAlpha = true
  const gl = canvas.getContext('webgl2', { premultipliedAlpha })

  const program = initProgram(gl)
  const a_position = gl.getAttribLocation(program, 'a_position')
  const a_glyph = gl.getAttribLocation(program, 'a_glyph')
  const a_color = gl.getAttribLocation(program, 'a_color')
  const u_resolution = gl.getUniformLocation(program, 'u_resolution')
  const u_image = gl.getUniformLocation(program, 'u_image')
  const positionGLBuffer = gl.createBuffer()
  const glyphGLBuffer = gl.createBuffer()
  const colorGLBuffer = gl.createBuffer()
  const positionBuffer = new Float32Array(max * 12)
  const glyphBuffer = new Float32Array(max * 12)
  const colorBuffer = new Float32Array(max * 6)
  const texture = gl.createTexture()
  const vao = gl.createVertexArray()

  gl.bindVertexArray(vao)

  gl.bindBuffer(gl.ARRAY_BUFFER, positionGLBuffer)
  gl.enableVertexAttribArray(a_position)
  gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, 0, 0)

  gl.bindBuffer(gl.ARRAY_BUFFER, glyphGLBuffer)
  gl.enableVertexAttribArray(a_glyph)
  gl.vertexAttribPointer(a_glyph, 2, gl.FLOAT, false, 0, 0)

  gl.bindBuffer(gl.ARRAY_BUFFER, colorGLBuffer)
  gl.enableVertexAttribArray(a_color)
  gl.vertexAttribPointer(a_color, 1, gl.FLOAT, false, 0, 0)

  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, !premultipliedAlpha)
  gl.enable(gl.BLEND)
  gl.blendFunc(premultipliedAlpha ? gl.SRC_ALPHA : gl.ONE, gl.ONE_MINUS_SRC_ALPHA)

  gl.activeTexture(gl.TEXTURE0 + 0)
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, font)
  gl.viewport(0, 0, canvas.width, canvas.height)

  gl.useProgram(program)
  gl.bindVertexArray(vao)
  gl.uniform2f(u_resolution, canvas.width, canvas.height)
  gl.uniform1i(u_image, 0)

  return {
    draw: (glyphs, positions) => {
      let i = -1
      let count = 0
      let doubleCount = 0
      while (++i < max) {
        if (!glyphs[i].glyph) continue
        colorBuffer.fill(glyphs[i].color, count, count += 6)
        positionBuffer.set(positions[i], doubleCount)
        glyphBuffer.set(glyphs[i].glyph, doubleCount)
        doubleCount += 12
      }
      if (!count) return
      gl.bindBuffer(gl.ARRAY_BUFFER, glyphGLBuffer)
      gl.bufferData(gl.ARRAY_BUFFER, glyphBuffer, gl.STATIC_DRAW)
      gl.bindBuffer(gl.ARRAY_BUFFER, positionGLBuffer)
      gl.bufferData(gl.ARRAY_BUFFER, positionBuffer, gl.STATIC_DRAW)
      gl.bindBuffer(gl.ARRAY_BUFFER, colorGLBuffer)
      gl.bufferData(gl.ARRAY_BUFFER, colorBuffer, gl.STATIC_DRAW)
      gl.drawArrays(gl.TRIANGLES, 0, count)
    },
    clear: () => {
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    }
  }
}
