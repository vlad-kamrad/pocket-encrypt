<script lang="ts">
  import { Toaster, toast } from "svelte-sonner";
  import { decodeBuffer, decodeFile } from "./lib/decoder";
  import type { FileCategory } from "./lib/file-category";
  import Preview from "./lib/Preview.svelte";
  import Tabs from "./lib/Tabs.svelte";

  let activeTabIndex = $state(0);

  let files = $state<FileList>();
  let remoteFolderPath = $state("");
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

    if (activeTabIndex === 0) {
      if (!files?.length) {
        toast.error("Has no files");
        return;
      }

      displayEntries = [];

      try {
        for (const file of files!) {
          const { blob, ...metadata } = await decodeFile({ file, password });
          displayEntries.push({
            src: URL.createObjectURL(blob),
            ...metadata,
          });
        }
      } catch (error) {
        console.error(error);
        toast.error("Decryption failed - wrong password or corrupted file.");
      }

      return;
    }

    if (activeTabIndex === 1) {
      // TODO: Change to good url validation
      if (!remoteFolderPath?.length) {
        toast.error("Invalid URL");
        return;
      }

      const metadata = await fetch(`${remoteFolderPath}/metadata.json`)
        .then(response => response.json())
        .catch(() => null);

      if (!metadata) {
        toast.error("In this folder doesn't exist the metadata.json");
        return;
      }

      displayEntries = [];

      const remoteFilePaths: string[] = metadata.map(
        (item: any) => `${remoteFolderPath}/${item.id}`
      );

      try {
        for (const path of remoteFilePaths) {
          const { blob, ...metadata } = await fetch(path)
            .then(response => response.arrayBuffer())
            .then(buffer => decodeBuffer({ buffer, password }));

          displayEntries.push({
            src: URL.createObjectURL(blob),
            ...metadata,
          });
        }
      } catch (error) {
        console.error(error);
        toast.error("Decryption failed - wrong password or corrupted file.");
      }

      return;
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
    <Tabs
      tabNames={["Direct Upload", "Remote Folder", "Info"]}
      bind:activeIndex={activeTabIndex}
    />

    <form onsubmit={onSubmit}>
      <fieldset class="grid">
        {#if activeTabIndex === 0}
          <input
            type="file"
            bind:files
            accept=".enc"
            multiple
            class="primary"
          />
        {/if}

        {#if activeTabIndex === 1}
          <input
            name="remote-resource"
            bind:value={remoteFolderPath}
            placeholder="Remote folder"
          />
        {/if}

        {#if activeTabIndex !== 2}
          <input
            type="password"
            name="password"
            bind:value={password}
            placeholder="Password"
            autocomplete="current-password"
          />

          <input type="submit" value="Decrypt" disabled={!password.length} />
        {/if}

        {#if activeTabIndex === 2}
          <p>
            If you have any questions, open the issue or idk
            <a href="https://github.com/vlad-kamrad/pocket-encrypt">
              source code
            </a>
          </p>
        {/if}
      </fieldset>
    </form>
  </section>

  {#if activeTabIndex !== 2}
    <section class="grid preview-section">
      {#each displayEntries as { src, name, category }}
        <Preview {src} {name} {category} />
      {/each}
    </section>
  {/if}
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
