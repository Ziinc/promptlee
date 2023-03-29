---
sidebar_position: 1
---

# Input Templating

Prompt input templating is where we insert additional information into a prompt template.

## Declaring an Input

Inputs are with a **@** symbol, and must be named.

All trailing characters after the **@** will be used as the name. Whitespace characters are not allowed within the name.

| Example                | Detected       | Name notes                            |
| ---------------------- | -------------- | ------------------------------------- |
| Here is a @sample_text | `@sample_text` | Underscores are allowed               |
| Here is a @sample text | `@sample`      | Whitespace characters are not allowed |
| Here is a @sample@text | `@sample@text` | `@` characters are allowed            |
| Here is a @SampleText  | `@SampleTextt` | Name is case sensitive                |
| Here is a @sample.     | `@sample.`     | Trailing symbols will be included     |
| Here is a @sample .    | `@sample`      | Trailing symbols will be included     |

### Handling Trailing Symbols in Input Names

In the above example, trailing symbols are recognized as part of the input name. This is by design and is to allow maximum flexibility. However, this may result in situations where punctuation gets picked up as part of the input name.

It is advised to add a space before such trailing punctuation so that the punctuation is not picked up.

## Insertion Behaviour

Each input declaration is considered as a placeholder and is replaced entirely when resolving the template's inputs

Multiple declarations are allowed, and will be replaced with the same value of the named input.

For example, we can declare multiple insertion positions and provide only one input to insert the value `rainbow` into multiple locations.

| Template | Input (**name: value**) | Resolved Text |
| Pick out colors of the **@object** . Describe why you picked this color from @object . | object: rainbow | Pick out colors of the **rainbow** . Describe why you picked this color from **rainbow** .|

Note that as per the advise in the [Handling Trailing Symbols section](#handling-trailing-symbols-in-input-names), we add a space after the named input, so that the named input does not include the full stop and the punctuation for the resolved text is correct.
