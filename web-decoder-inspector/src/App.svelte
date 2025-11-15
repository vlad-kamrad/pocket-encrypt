<script lang="ts">
  import { Toaster, toast } from "svelte-sonner";
  import { decodeFile } from "./lib/decoder";
  import type { FileCategory } from "./lib/file-category";
  import Preview from "./lib/Preview.svelte";

  let files = $state<FileList>();
  let password = $state("");

  let displayEntries = $state<
    Array<{
      src: string;
      name: string;
      ext: string | null;
      mime: string | null;
      category: FileCategory;
    }>
  >([]);

  async function onSubmit(event: SubmitEvent) {
    event.preventDefault();

    if (!files?.length) {
      toast.error("Has no files");
    }

    try {
      displayEntries = [];
      for (const file of files!) {
        const { blob, ...metadata } = await decodeFile({ file, password });

        displayEntries.push({
          src: URL.createObjectURL(blob),
          ...metadata,
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Decryption failed — wrong password or corrupted file.");
    }
  }
</script>

<Toaster position="top-center" />
<header>
  <h1>Web Decoder</h1>
  <a href="https://github.com/vlad-kamrad/pocket-encrypt">source code</a>
</header>
<main>
  <section>
    <form onsubmit={onSubmit}>
      <fieldset class="grid">
        <input type="file" bind:files accept=".enc" multiple class="primary" />

        <input
          type="password"
          name="password"
          bind:value={password}
          placeholder="Password"
          autocomplete="new-password"
        />

        <input
          type="submit"
          value="Decrypt"
          disabled={!files?.length || !password.length}
        />
      </fieldset>
    </form>
  </section>

  <section class="grid preview-section">
    {#each displayEntries as { src, name, category }}
      <Preview {src} {name} {category} />
    {/each}
  </section>
</main>
<footer>All right reserved</footer>

<style lang="scss">
  header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
  }
  .preview-section {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
</style>
