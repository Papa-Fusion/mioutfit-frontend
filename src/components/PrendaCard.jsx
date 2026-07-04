function PrendaCard({ nombre, categoria, imagen }) {
  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: '12px',
      padding: '16px',
      width: '220px',
      textAlign: 'center'
    }}>
      <img
        src={imagen}
        alt={nombre}
        style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }}
      />
      <h3>{nombre}</h3>
      <p style={{ color: '#777' }}>{categoria}</p>
    </div>
  );
}

export default PrendaCard;