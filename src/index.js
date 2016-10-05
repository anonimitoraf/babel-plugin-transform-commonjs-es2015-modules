export default ({types: t}) => ({
  visitor: {
    CallExpression (path) {
      if (
        t.isIdentifier(path.node.callee, {name: 'require'}) &&
        t.isStringLiteral(path.node.arguments[0]) &&
        path.node.arguments.length === 1
      ) {
        const dependencyName = path.node.arguments[0].value

        // Scenario:
        // var foo = require('bar')

        if (
          t.isVariableDeclarator(path.parentPath.node) &&
          t.isIdentifier(path.parentPath.node.id)
        ) {
          const assignedName = path.parentPath.node.id.name

          if (t.isVariableDeclaration(path.parentPath.parentPath.node)) {
            path.parentPath.parentPath.replaceWith(
              t.importDeclaration(
                [t.importDefaultSpecifier(
                  t.identifier(assignedName)
                )],
                t.stringLiteral(dependencyName)
              )
            )
          }
        }

        // Scenario:
        // var foo = require('bar').baz;

        else if (
          t.isMemberExpression(path.parentPath.node, {computed: false})
        ) {
          const memberExpressionPath = path.parentPath
          const propertyName = memberExpressionPath.node.property

          if (
            t.isVariableDeclarator(memberExpressionPath.parentPath.node) &&
            t.isIdentifier(memberExpressionPath.parentPath.node.id)
          ) {
            const assignedName = memberExpressionPath.parentPath.node.id

            if (t.isVariableDeclaration(memberExpressionPath.parentPath.parentPath.node)) {
              memberExpressionPath.parentPath.parentPath.replaceWith(
                t.importDeclaration(
                  [t.importSpecifier(
                    assignedName,
                    propertyName
                  )],
                  t.stringLiteral(dependencyName)
                )
              )
            }
          }
        }
      }
    },

    MemberExpression (path) {
      if (
        t.isIdentifier(path.node.object, {name: 'module'}) &&
        t.isIdentifier(path.node.property, {name: 'exports'})
      ) {
        if (
          t.isAssignmentExpression(path.parentPath.node) &&
          t.isExpressionStatement(path.parentPath.parentPath.node)
        ) {
          const assignmentExpression = path.parentPath

          // Scenario:
          // module.exports = require('foo');

          if (
            t.isCallExpression(assignmentExpression.node.right) &&
            t.isIdentifier(assignmentExpression.node.right.callee, {name: 'require'}) &&
            t.isStringLiteral(assignmentExpression.node.right.arguments[0]) &&
            assignmentExpression.node.right.arguments.length === 1
          ) {
            assignmentExpression.parentPath.replaceWith(
              t.exportAllDeclaration(
                assignmentExpression.node.right.arguments[0]
              )
            )
          }

          // Scenario:
          // module.exports = bar;

          else if (t.isExpression(assignmentExpression.node.right)) {
            assignmentExpression.parentPath.replaceWith(
              t.exportDefaultDeclaration(
                assignmentExpression.node.right
              )
            )
          }
        }

        else if (
          t.isMemberExpression(path.parentPath.node)
        ) {
          const subMemberExpression = path.parentPath
          const namedExport = subMemberExpression.node.property

          if (
            t.isAssignmentExpression(subMemberExpression.parentPath.node) &&
            t.isExpressionStatement(subMemberExpression.parentPath.parentPath.node)
          ) {
            const assignmentExpression = subMemberExpression.parentPath

            // Scenario:
            // module.exports.foo = require('bar');

            if (
              t.isCallExpression(assignmentExpression.node.right) &&
              t.isIdentifier(assignmentExpression.node.right.callee, {name: 'require'}) &&
              t.isStringLiteral(assignmentExpression.node.right.arguments[0]) &&
              assignmentExpression.node.right.arguments.length === 1
            ) {
              assignmentExpression.parentPath.replaceWith(
                t.exportNamedDeclaration(
                  null,
                  [t.exportSpecifier(
                    t.identifier('default'),
                    namedExport
                  )],
                  assignmentExpression.node.right.arguments[0]
                )
              )
            }

            // Scenario:
            // module.exports.foo = bar;

            else if (t.isExpression(assignmentExpression.node.right)) {
              assignmentExpression.parentPath.replaceWith(
                t.exportNamedDeclaration(
                  t.variableDeclaration(
                    'var',
                    [t.variableDeclarator(
                      namedExport,
                      assignmentExpression.node.right
                    )]
                  ),
                  []
                )
              )
            }
          }
        }
      }

      else if (
        t.isIdentifier(path.node.object, {name: 'exports'}) &&
        t.isAssignmentExpression(path.parentPath.node)
      ) {
        const assignmentExpression = path.parentPath
        const namedExport = path.node.property

        // Scenario:
        // exports.foo = require('bar');

        if (
          t.isCallExpression(assignmentExpression.node.right) &&
          t.isIdentifier(assignmentExpression.node.right.callee, {name: 'require'}) &&
          t.isStringLiteral(assignmentExpression.node.right.arguments[0]) &&
          assignmentExpression.node.right.arguments.length === 1
        ) {
          assignmentExpression.parentPath.replaceWith(
            t.exportNamedDeclaration(
              null,
              [t.exportSpecifier(
                t.identifier('default'),
                namedExport
              )],
              assignmentExpression.node.right.arguments[0]
            )
          )
        }

        // Scenario:
        // exports.foo = bar;

        else if (t.isExpression(assignmentExpression.node.right)) {
          assignmentExpression.parentPath.replaceWith(
            t.exportNamedDeclaration(
              t.variableDeclaration(
                'var',
                [t.variableDeclarator(
                  namedExport,
                  assignmentExpression.node.right
                )]
              ),
              []
            )
          )
        }
      }
    }
  }
})
