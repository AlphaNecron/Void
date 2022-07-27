import Fallback from 'components/Fallback';

export default function Page_Domains() {
  return (
    <Fallback loaded={false}>
      {() => <></>}
    </Fallback>
  );
}

Page_Domains.adminOnly = true;
Page_Domains.title = 'Domains';
