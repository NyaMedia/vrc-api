<script lang="ts">
  let script: string = $state("");

  let pool = $state("");

  async function generate(pool: string) {
    pool.trim();

    const re = /^[A-Za-z0-9_-]+$/;
    if (!re.test(pool) || pool.length < 5) {
      script =
        "Invalid pool name. Please use only letters, numbers, dashes, and underscores, and ensure it is longer than 5 characters.";
      return;
    }

    script = "public VRCUrl[] vrcurl_pool = {\n";

    for (let i = 0; i < 10000; i++) {
      script += ` new VRCUrl("https://nya.llc/vrc/v1/url/${pool}/${i}"),\n`;
    }
    script += "};";
  }
</script>

<div class="flex min-h-screen items-start justify-center p-6">
  <div class="w-full max-w-3xl rounded-lg bg-zinc-900 p-6 shadow-md">
    <label for="pool" class="mb-2 block text-sm font-medium text-zinc-200">Pool name</label>
    <input
      id="pool"
      type="text"
      bind:value={pool}
      placeholder="Enter pool name"
      oninput={() => generate(pool)}
      class="block w-full rounded-md border border-zinc-800 px-3 py-2 placeholder-zinc-400 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
    />

    <label for="script" class="mt-4 mb-2 block text-sm font-medium text-zinc-200"
      >Generated array</label
    >
    <textarea
      id="script"
      bind:value={script}
      rows={10}
      cols={50}
      class="block h-64 w-full resize-y rounded-md border border-zinc-800 bg-zinc-900 p-3 font-mono text-sm text-green-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
    ></textarea>
  </div>
</div>
