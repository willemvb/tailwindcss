import fs from 'fs'
import _ from 'lodash'
import postcss from 'postcss'

function updateSource(nodes, source) {
  return _.tap(Array.isArray(nodes) ? postcss.root({ nodes }) : nodes, tree => {
    tree.walk(node => (node.source = source))
  })
}

export default function(config, { components: pluginComponents }, generatedUtilities) {
  return function(css) {
    css.walkAtRules('tailwind', atRule => {
      if (atRule.params === 'preflight') {
        const preflightTree = postcss.parse(
          fs.readFileSync(`${__dirname}/../../css/preflight.css`, 'utf8')
        )

        atRule.before(updateSource(preflightTree, atRule.source))
        atRule.remove()
      }

      if (atRule.params === 'components') {
        atRule.before(updateSource(pluginComponents, atRule.source))
        atRule.remove()
      }

      if (atRule.params === 'utilities') {
        atRule.before(updateSource(generatedUtilities, atRule.source))
        atRule.remove()
      }
    })
  }
}
