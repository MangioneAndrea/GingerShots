<script>
  import Review from '../components/Review.svelte';
  import CardSlider from '../templates/CardSlider.svelte';
  import Table from '../templates/Table.svelte';
</script>

<div>
  <CardSlider
    template={Review}
    cards={[
      { author: 'Andrea', rating: 4, date: new Date(), description:"nice" },
      { author: 'Toby', rating: 2, date: new Date() },
    ]}
  />
</div>
