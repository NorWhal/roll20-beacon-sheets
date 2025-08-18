import antfu from "@antfu/eslint-config";

export default antfu({
  vue: true,
  stylistic: {
    quotes: "double",
    semi: true,
  },
  overrides: {
    vue: {
      "vue/block-order": [
        "error",
        {
          order: ["template", "script", "style"],
        },
      ],
      "vue/component-name-in-template-casing": ["error", "PascalCase"],
    },
  },
});
