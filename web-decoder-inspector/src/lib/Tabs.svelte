<script lang="ts">
  interface Props {
    tabNames: string[];
    activeIndex: number;
  }

  let { tabNames, activeIndex = $bindable() }: Props = $props();
</script>

<div role="group">
  {#each tabNames as tabName, index}
    <button
      class:secondary={index !== activeIndex}
      onclick={() => (activeIndex = index)}
    >
      {tabName}
    </button>
  {/each}
</div>
