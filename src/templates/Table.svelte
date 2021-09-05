<script>
  import { Icon } from 'svelte-materialify';
  import { mdiSortDescending, mdiSortAscending } from '@mdi/js';

  export let data;
  export let columns;
  export let onRowClick = () => {};

  $: sortedData = [...data];

  const sorted = { field: null, direction: 0 };

  const sortBy = (key) => {
    if (sorted.field === key) {
      sorted.direction++;

      switch (sorted.direction) {
        case 0:
          sortedData = [...data];
          return;
        case 2:
          sorted.direction = -1;
        case 1:
        default:
      }
    } else {
      sorted.field = key;
      sorted.direction = 1;
    }

    const col = columns.find((el) => el.field === key);

    sortedData = sortedData.sort((a, b) => {
      if (col.sortValueGetter) {
        if (col.sortValueGetter(a[key]) > col.sortValueGetter(b[key]))
          return 1 * sorted.direction;
        if (col.sortValueGetter(a[key]) < col.sortValueGetter(b[key]))
          return -1 * sorted.direction;
      } else {
        if (a[key] > b[key]) return 1 * sorted.direction;
        if (a[key] < b[key]) return -1 * sorted.direction;
      }
      return 0;
    });
  };
</script>

<div class="container table">
  <table>
    <thead>
      <tr>
        {#each columns as { name, sortable, field }}
          <th on:click={sortable && (() => sortBy(field))}
            >{name}
            {#if sorted.field === field}
              {#if sorted.direction === 1}
                <Icon path={mdiSortAscending} />
              {:else if sorted.direction === -1}
                <Icon path={mdiSortDescending} />
              {/if}
            {/if}
          </th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each sortedData as d}
        <tr on:click={() => onRowClick(d)}>
          {#each columns as { field, renderer, name, formatter=(a)=>a }}
            {#if renderer}
              <td class="s-tbl-cell">
                <svelte:component
                  this={renderer.component}
                  {...{
                    [renderer.argName || field]: formatter(d[field]),
                  }}
                />
              </td>
            {:else}
              <td class="s-tbl-cell">
                {formatter(d[field || name]) || ''}
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
      flex: 1;

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
