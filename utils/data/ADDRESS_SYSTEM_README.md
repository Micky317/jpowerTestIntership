# 📍 Sistema de Direcciones Aleatorias

Sistema simple para usar **direcciones aleatorias de Estados Unidos** en los tests.

## 🎯 Uso

### Llenar un campo de dirección

```typescript
import { selectAddress } from '@/utils/input';

// Selecciona una dirección aleatoria
await selectAddress(page, '#address');

// Con línea 2
await selectAddress(page, '#address', 'Apt 5B');
```

### Obtener solo el objeto de dirección

```typescript
import { getAddress } from '@/utils/input';

const address = getAddress();
console.log(address);
// { street: "350 Fifth Ave", city: "New York", state: "NY", zip: "10118" }
```

## 📍 Direcciones Disponibles

El archivo `addresses.json` contiene **15 direcciones diferentes** de ciudades de EE.UU.:

- Oakland, CA
- Springfield, IL
- Washington, DC
- New York, NY
- Cupertino, CA
- Chicago, IL
- San Francisco, CA
- Los Angeles, CA
- Austin, TX
- Seattle, WA
- Miami, FL
- Denver, CO
- Boston, MA
- Portland, OR
- Atlanta, GA

## ➕ Agregar Más Direcciones

Edita `utils/data/addresses.json`:

```json
{
  "street": "123 Example St",
  "city": "CityName",
  "state": "XX",
  "zip": "12345"
}
```

**Importante**: Solo direcciones de EE.UU. (la API solo funciona con direcciones de EE.UU.)

## ✨ Ventajas

✅ **Direcciones diferentes** en cada ejecución  
✅ **Simple** - solo llama la función  
✅ **15 direcciones** para elegir aleatoriamente  
✅ **Todas de EE.UU.** - compatible con la API  

## 📋 Ejemplo Completo

```typescript
test("Create multiple properties with different addresses", async ({ page }) => {
  // Cada una tendrá una dirección aleatoria diferente
  await selectAddress(page, '#property1-address');
  await selectAddress(page, '#property2-address');
  await selectAddress(page, '#property3-address');
});
```
