/**
 * [todo]
 * - [ ] generate index
 * - [ ] generate assets
 * - [ ] custom hammerjs
 * - [ ] custom highlight.js
 * - [ ] custom style
 */

/**
 * 0. prepare nuxt project
 *   - `static/`
 *   - `pages/`
 *   - `components/`
 *     - `slides.vue`
 *   - `nuxt.config.js`
 *   - `package.json`
 *   - `yarn.lock`
 * 1. cp all files into`static`
 * 2. find all`<name>.md` or`<name>/README.md`
 * 3. generate`pages/<name>.vue`
 * 4. generate`pages/index.vue`
 * 5. build
 */
const path = require('path')
const fs = require('fs-extra')
const readdirp = require('readdirp')
// const { Nuxt, Builder, Generator } = require('nuxt')
// const config = require('./nuxt.config.js')

const templateRoot = path.join(__dirname, 'template')
const templateDirs = [
  'static',
  'pages',
  'components'
]
const templateFiles = [
  'components/slides.vue',
  // 'nuxt.config.js'
]
const pageTemplatePath = path.join(templateRoot, 'pages', 'template.vue')
const pageTemplate = fs.readFileSync(pageTemplatePath, { encoding: 'utf8' })
const generatePage = content => pageTemplate.replace(/\`\<TEMPLATE_CONTENT\>\`/, content)

const generate = (src = 'input', dist = 'output') => {
  const inputRoot = path.join(__dirname, src)
  const outputRoot = path.join(__dirname, dist)
  const outputStatic = path.join(outputRoot, 'static')
  const outputPages = path.join(outputRoot, 'pages')
  fs.ensureDirSync(outputRoot)
  templateDirs.map(filepath => path.join(outputRoot, filepath)).forEach(filepath => {
    fs.ensureDirSync(filepath)
  })
  templateFiles.forEach(filepath => {
    fs.copySync(
      path.join(templateRoot, filepath),
      path.join(outputRoot, filepath)
    )
  })
  fs.copySync(inputRoot, outputStatic)
  const pages = []
  readdirp({
    root: outputStatic,
    fileFilter: ['*.md'],
    depth: 1
  }).on('data', entry => {
    const [, name] = entry.path.match(/^([^\/]+)(\/README\.md|\.md)$/) || []
    if (name) {
      const content = fs.readFileSync(entry.fullPath, { encoding: 'utf8' })
      const output = generatePage(JSON.stringify(content))
      fs.outputFileSync(path.join(outputPages, `${name}.vue`), output)
      pages.push(name)
    }
  }).on('end', async () => {
    // `pages/index.vue`
    const indexContent = pages.map(name => `- [${name}](./${name})`).join('\n')
    const indexOutput = generatePage(JSON.stringify(`### My Slides\n\n${indexContent}`))
    fs.outputFileSync(path.join(outputPages, 'index.vue'), indexOutput)
    console.log('output dir generated')
    // generate
    // const nuxt = new Nuxt(config)
    // const builder = new Builder(nuxt)
    // const generator = new Generator(nuxt, builder)
    // // console.log(nuxt, builder, generator)
    // console.log(generator)
    // generator.generate({ init: true, build: true }).then(() => {
    //   console.log('generated')
    // })
  })
}

generate()