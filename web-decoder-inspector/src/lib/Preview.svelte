<script lang="ts">
  import type { FileCategory } from "./file-category";

  interface Props {
    category: FileCategory;
    src: string;
    name: string;
  }

  const { category, name, src }: Props = $props();
</script>

<div class="wrapper">
  {#if category === "image"}
    <img {src} alt={name} />
  {:else if category === "video"}
    <video {src} controls>
      <track kind="captions" />
    </video>
  {:else if category === "audio"}
    <audio {src} controls></audio>
  {:else if category === "pdf"}
    <iframe {src} title="title" style="width:100%;height:500px;"></iframe>
  {:else if category === "text"}
    <pre>{src}</pre>
  {:else}
    <b>No Preview</b>
  {/if}

  <div class="controls">
    <b data-tooltip="Tooltip">{name}</b>

    <a href={src} download={name} role="button">download</a>
  </div>
</div>

<style lang="scss">
  .wrapper {
    img,
    audio,
    video {
      width: 100%;
    }

    .controls {
      margin-top: 8px;

      display: flex;
      align-items: center;
      justify-content: space-between;
    }
  }
</style>
