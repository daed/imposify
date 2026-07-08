import Impose from "./imposify2.mjs";

// this is just the glue between a browser File and the Impose class (which
// doesn't know anything about browsers or React).  everything else should
// just call this instead of poking at Impose directly.
export async function imposeFile(file, options) {
  const impose = new Impose();
  await impose.loadPDF(await file.arrayBuffer());
  const bytes = await impose.createBooklet(options);
  return new Blob([bytes], { type: "application/pdf" });
}
