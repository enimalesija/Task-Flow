export default function Toast({ text }: { text: string }) {
  return <div className="toast"><i className="fa-solid fa-circle-info icon" aria-hidden />{text}</div>;
}
