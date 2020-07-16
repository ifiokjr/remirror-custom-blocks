import { PlainExtension } from "@remirror/core";
import uuid from "uuid";

const isTargetNodeOfType = (node, type) => (node.type === type);

const isNodeHasAttribute = (node, attrName) => Boolean(node.attrs && node.attrs[attrName]);

const isNodeAttributeDuplicate = (node, attrName, seenIds) => isNodeHasAttribute(node, attrName) && seenIds.includes(node.attrs[attrName]);

export default class CustomBlockExtension extends PlainExtension<> {
  createPlugin() {
    const { idAttribute } = this.options;

    return {
      appendTransaction: (transactions, prevState, nextState) => {
        const { tr } = nextState;
        let modified = false;
        let seenIds = [];

        if (transactions.some((transaction) => transaction.docChanged)) {
          // Adds a unique id to a node
          nextState.doc.descendants((node, pos) => {
            const {paragraph} = nextState.schema.nodes;
            if (isTargetNodeOfType(node, paragraph) && (!isNodeHasAttribute(node, idAttribute) || isNodeAttributeDuplicate(node, idAttribute, seenIds))) {
              const attrs = node.attrs;
              tr.setNodeMarkup(pos, undefined, {...attrs, [idAttribute]: uuid.v4()});
              modified = true;
            }
            const existingId = node.attrs && node.attrs[idAttribute];
            if (existingId) {
              seenIds.push(existingId);
            }
          });
        }

        return modified ? tr : null;
      },
    }
  }
}
