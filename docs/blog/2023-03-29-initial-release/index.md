---
title: Initial Release
authors: ziinc
tags: [release]
draft: true
---

This blog post marks the first release of PromptPro into the wild. This release was the product of slightly more than a week of hacking on a key idea that I had when reading about all of the latest news about ChatGPT and all of the cool things that it can do.

## The Idea

I realised that there was such a massive potential for such a technology to make life easier for the average professional, opening up so much avenues for the average non-technical person. They could essentially tell ChatGPT to perform normally tedious tasks, instead of performing them manually. The incredibly low cost of the OpenAI's ChatGPT means that it is magnitudes cheaper to write a well-crafted prompt and repeatedly use it, than to outsource it to a person and have to train the individual(s).

I like to think of ChatGPT as the intern that tries really hard to be helpful but is overly confident in its factual knowledge. And we can basically throw time consuming and menial task over to our intern for pennies on the dollar, and even if it isn't a great output on the first try, we can keep refining our instructions until it is perfect every time.

## The Requirements

I knew that I wanted to build something off the ChatGPT API, and it was definitely interesting to explore the ways in which we could make the entire process even more user friendly, such that even my non-technically inclined mother could use it. I started to think up of certain use cases that my ideal future user (hi mom) would pass on to ChatGPT and let it do for her.

Some examples that would help her day job (she teaches young children privately 👩‍🏫):

1. Drafting up an email newsletter to her students' parents.
2. Reformatting of large online texts into small readable chunks for read-aloud tests.
3. Creating cloze passage vocabulary tests for her students.

With these example issues, I got around to the key requirements we need to make these a reality:

1. We want to make the prompt repeatable, but at the same time, accept varying input.
2. We want to be able to view what the prompt had returned before, so that we can refine the command in order to create a better sandbox for the returned information.
3. We want to have the prompt at the ready to quickly execute the prompt when needed.

### The Initial Wireframes

I am no designer, I identify as a developer throguh and through. However, I've needed to delve into web design enough times to have a sort of knack at knowing what works and what doesn't via a simple low-fidelity wireframe.
