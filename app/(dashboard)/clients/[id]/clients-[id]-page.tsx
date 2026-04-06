import ClientDetailView from "./client-detail-view";

export default function Page(props: { params: Promise<{ id: string }> }) {
  return <ClientDetailView params={props.params} />;
}
