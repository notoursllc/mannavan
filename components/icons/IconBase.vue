

<script>
export default {
    props: {
        iconName: {
            type: String,
            default: 'box'
        },
        iconColor: {
            type: String,
            default: 'currentColor'
        },
        viewBox: {
            type: [String]
        },
    }
}
</script>

<template>
  <svg xmlns="http://www.w3.org/2000/svg"
    :viewBox="viewBox"
    :aria-labelledby="iconName"
    role="presentation">
    <title :id="iconName" lang="en">{{iconName}} icon</title>
    <g :fill="iconColor">
      <slot />
    </g>
  </svg>
</template>

<style scoped>
svg {
  display: inline-block;
  vertical-align: baseline;
  margin-bottom: -2px; /* yes, I'm that particular about formatting */
  border:1px solid red;
}
</style>
