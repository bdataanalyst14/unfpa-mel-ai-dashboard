#!/usr/bin/env bash
set -euo pipefail

arguments=("$@")
apply=false
index=0
while [[ "$index" -lt "${#arguments[@]}" ]]; do
  argument="${arguments[$index]}"
  case "$argument" in
    --dry-run|--validate-only|--redacted-summary) ;;
    --apply) apply=true ;;
    --mode)
      index=$((index + 1))
      [[ "$index" -lt "${#arguments[@]}" ]] || { echo "Missing configuration mode" >&2; exit 2; }
      [[ "${arguments[$index]}" == "bigquery-readonly" || "${arguments[$index]}" == "full-pipeline" ]] || { echo "Unsupported configuration mode" >&2; exit 2; }
      ;;
    *) echo "Unsupported option" >&2; exit 2 ;;
  esac
  index=$((index + 1))
done

release_link="${UNFPA_MEL_ACTIVE_RELEASE:-/opt/unfpa-mel-dashboard/current}"
if [[ ! -e "$release_link" ]]; then
  echo "Active release not found" >&2
  exit 1
fi

release_dir="$(cd "$release_link" && pwd -P)"
wizard="$release_dir/scripts/pipeline/configure-ubuntu.js"
if [[ ! -f "$wizard" ]]; then
  echo "Configuration wizard not found in active release" >&2
  exit 1
fi

if [[ "$apply" == "true" && "${EUID}" -ne 0 ]]; then
  echo "Apply requires root" >&2
  exit 1
fi

npm_bin="$(command -v npm || true)"
if [[ -z "$npm_bin" ]]; then
  echo "npm not found" >&2
  exit 1
fi

cd "$release_dir"
"$npm_bin" run pipeline:configure -- "${arguments[@]}"

echo "Pipeline timers were not installed or enabled."
echo "Dashboard was not restarted and remains mock-backed."
