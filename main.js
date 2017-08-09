#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const Highlights = require('highlights')
const highlighter = new Highlights()
const juice = require('juice')
const argv = require('minimist')(process.argv.slice(2))
const opn = require('opn')

// Validate source
const sourcePath = argv._[0]
if(sourcePath == null || !fs.existsSync(sourcePath)) {
  console.log(`- invalid file path`)
  process.exit()
}
const sourceExtension = path.extname(sourcePath).split(".")[1]
console.log(`- processing ${sourcePath}`)

// Get grammar
highlighter.loadGrammarsSync()
const grammar = highlighter.registry.grammars.find((g) => g.fileTypes.indexOf(sourceExtension) !== -1 )
if(grammar == null) {
  console.log(`- language not found for extension ${sourceExtension}`)
  process.exit()
}
console.log(`- language detected: ${grammar.name}`)

// Highlight Snippet
let html = highlighter.highlightSync({fileContents: fs.readFileSync(sourcePath, {encoding: "utf-8"}), scopeName: grammar.scopeName})

  // Inlince CSS
const cssString = ".comment{color:#3E7FFF;font-style:italic;}.string{color:#007A05;}.string .source,.string .meta.embedded.line{color:#5A5A5A;}.string .punctuation.section.embedded{color:#920B2D;}.string .punctuation.section.embedded .source{color:#920B2D;}.constant.numeric{color:#D14;}.constant.language{color:#606aa1;}.constant.character,.constant.other{color:#606aa1;}.constant.symbol{color:#990073;}.constant.numeric.line-number.find-in-files .match{color:rgba(143,190,0,0.63);}.variable{color:#2733FF;}.variable.parameter{color:#606aa1;}.keyword{color:#222;font-weight:bold;}.keyword.unit{color:#445588;}.keyword.special-method{color:#0086B3;}.storage{color:#222;}.storage.type{color:#222;}.entity.name.class{text-decoration:underline;color:#606aa1;}.entity.other.inherited-class{text-decoration:underline;color:#606aa1;}.entity.name.function{color:#900;}.entity.name.tag{color:#2733FF;}.entity.other.attribute-name{color:#2744FF;font-weight:normal;}.entity.name.filename.find-in-files{color:#E6DB74;}.support.constant,.support.function,.support.type{color:#458;}.support.class{color:#2733FF;}.invalid{}.invalid.deprecated{color:#F8F8F0;background-color:#8FBE00;}.meta.structure.dictionary.json > .string.quoted.double.json,.meta.structure.dictionary.json > .string.quoted.double.json .punctuation.string{color:#000080;}.meta.structure.dictionary.value.json > .string.quoted.double.json{color:#d14;}.meta.diff,.meta.diff.header{color:#75715E;}.css.support.property-name{font-weight:bold;color:#333;}.css.constant{color:#099;}.source.gfm{color:#444;}.gfm .markup.heading{color:#111;}.gfm .link{color:#888;}.gfm .variable.list{color:#888;}.markdown .paragraph{color:#444;}.markdown .heading{color:#111;}.markdown .link{color:#888;}.markdown .link .string{color:#888;}.punctuation.definition.tag.begin,.entity.name.tag,.punctuation.definition.tag.end{font-weight:bold;color:#2733FF;}"
html = juice(html, {extraCss: cssString})

// Create html
const templateString = "<html><head><style type='text/css' media='screen'>body { padding: 32px; background: #FFFFFF; } .codesnip { background: #FAFAFA; } pre.editor { margin: 0; padding: 12px 12px 16px; overflow-x: scroll; } .helper { border-bottom: 1px solid #EEE; padding: 4px 12px; color: #BBB; font-family: monospace; }</style></head><body><div class='helper'>{{TITLE}}:</div><div class='codesnip'>{{CONTENTS}}</div></body></html>"
const result = templateString.replace("{{TITLE}}", grammar.name).replace("{{CONTENTS}}", html)
const snippetPath = `${sourcePath}.snippet.html`
fs.writeFileSync(snippetPath, result)
opn(snippetPath, {wait: false})

console.log(`- created snippet at ${snippetPath}`)
