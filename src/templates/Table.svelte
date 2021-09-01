<script>
  export let data;
  export let columns;
  export let onRowClick;
</script>

<div class="container table">
  <table>
    <thead>
      <tr>
        {#each columns as { name }}
          <th>{name}</th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each data as d}
        <tr on:click={() => onRowClick(d)}>
          {#each columns as { value, renderer, name, formatter=(a)=>a }}
            {#if renderer}
              <td class="s-tbl-cell">
                <svelte:component
                  this={renderer.component}
                  {...{
                    [renderer.argName || value]: formatter(d[value]),
                  }}
                />
              </td>
            {:else}
              <td class="s-tbl-cell">
                {formatter(d[value || name]) || ""}
              </td>
            {/if}
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style type="text/scss">
  div.container {
    border-color: var(--theme-dividers);
    border-style: solid;
    border-width: 1px;
    border-radius: 4px;
    display: inline-flex;

    table {
      border-collapse: collapse;
      width: inherit;

      thead {
        font-weight: 500;
      }

      tbody {
        tr {
          border-top-color: var(--theme-dividers);
          border-top-style: solid;
          border-top-width: 1px;

          &:hover {
            background-color: var(--theme-datatables-row-hover);
          }
        }
      }

      th,
      td {
        padding-left: 16px;
        padding-right: 16px;
        text-align: center;

        &.numeric {
          text-align: right;
        }
      }

      th {
        height: 56px;
      }
      td {
        height: 52px;
      }
    }
  }
</style>
