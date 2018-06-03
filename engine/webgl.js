const vertexShaderSource = `#version 300 es

in vec2 a_position;
in vec2 a_texCoord;
uniform vec2 u_resolution;
out vec2 v_texCoord;

void main() {
  gl_Position = vec4((a_position / u_resolution * 2.0 - 1.0) * vec2(1, -1), 0, 1);
  v_texCoord = a_texCoord;
}`

const fragmentShaderSource = `#version 300 es
precision mediump float;

uniform sampler2D u_image;
uniform vec4 u_color;
in vec2 v_texCoord;
out vec4 outColor;

void main() {
  outColor = texture(u_image, v_texCoord) * u_color;
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

export const initWebGL = (canvas, font) => {
  const premultipliedAlpha = true
  const gl = canvas.getContext('webgl2', { premultipliedAlpha })

  const program = initProgram(gl)
  const a_position = gl.getAttribLocation(program, 'a_position')
  const texCoordAttributeLocation = gl.getAttribLocation(program, 'a_texCoord')
  const u_resolution = gl.getUniformLocation(program, 'u_resolution')
  const u_color = gl.getUniformLocation(program, 'u_color')
  const u_image = gl.getUniformLocation(program, 'u_image')
  const vao = gl.createVertexArray()
  const positionBuffer = gl.createBuffer()
  const colorBuffer = gl.createBuffer()
  const texture = gl.createTexture()
  const texCoordBuffer = gl.createBuffer()

  gl.bindVertexArray(vao)

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  gl.enableVertexAttribArray(a_position)
  gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, 0, 0)

  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer)
  gl.enableVertexAttribArray(texCoordAttributeLocation)
  gl.vertexAttribPointer(texCoordAttributeLocation, 2, gl.FLOAT, false, 0, 0)

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
    colorize: (r, g, b) => gl.uniform4f(u_color, r, g, b, 1),
    draw: (glyph, position) => {
      if (!glyph) return
      gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer)
      gl.bufferData(gl.ARRAY_BUFFER, glyph, gl.STATIC_DRAW)
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
      gl.bufferData(gl.ARRAY_BUFFER, position, gl.STATIC_DRAW)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
    },
    clear: () => {
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    }
  }
}
