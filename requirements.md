#Contexto
yo como dueño de restaurante de comidas necesito construir un software para instalar en computadores, tablets, celulares (windows, macOs, ios, android),
necesito que tenga caracteristicas como:

1. gestionar productos y recetas
2. gestionar clientes
3. gestionar proveedores
4. gestionar ventas, facturas, facturacion electronica
5. ingresar pedidos por mesas
6. gestionar empleados, turnos y pagos de nomina
7. generar reportes por ventas con rangos de fecha
8. establecer metas de ventas y pedidos

#Objetivos

1. software intuitivo, facil de configurar y para posible escalamiento horizontal y vertical
2. prototipable para vender licencias de uso a otros dueños de restaurantes
3. una interfaz amigable y accesible
4. manejo de roles como: super admin, admin, mesero, cajero y contador
5. cada modulo y sub modulo debe tener permisos configurables y asignables para cada rol
6. el software debe tener la caracteristica de offline first y sincronizar todas las terminales con la nube
7. el software debe conectarse a una impresora termica configurables para imprimir comandas de cocina y facturas
8. la eliminacion de cualquier informacion o registro de bbdd debe ser un cambio de estado para que no este disponible (soft delete)

#Modulos propuestos
Los siguientes modulos son requeridos para el funcionamiento básico, puedes proponer segun tu experiencia y experto del tema en el sector.

1. modulo de clientes

- crear clientes con datos basico y datos para domicilio
- editar informacion del clientes
- eliminar clientes (solo debe hacerlo un rol superior)
- ver informacion cruzada, es decir cualquier asociacion de informacion que se encuentre en bbdd
- crear un sistema de puntos para que el cliente pueda redimirlos en descuento de porcentaje o dinero (sistema de recompensas configurable)

2. modulo de productos

- crear insumos y asignarlo a un proveedor, debe permitir añadir costo unitario (gramo, unidad, litro)
- crear productos o platos con recetas el cual se le puede asignar recetas con los insumos
- crear o configurar combos, promociones, variante de productos, categorias de productos
- gestionar inventarios de producto y platos al estilo kardex
- gestionar movimientos de inventarios

3. modulo de proveedores

- crear y editar proveedores
- eliminar proveedores, solo roles con el permiso lo pueden hacer
- ingresar facturas de los proveedores, marcar si es a credito o pago de contando
- al ingresar facturas seleccionar los insumos y hacer el movimiento de inventario para tenerlo en cuenta en el kardex

4. modulo de ventas

- crear un pedido a una mesa o domicilio
- permitir asignar descuento en dinero o porcentaje
- asignar a "cliente general" o cliente ya registrado
- permitir aplicar o no aplicar servicio voluntario "propina", la propina puede ser configurable
- permitir mover pedido entre mesas, aumentar o disminuir unidades al producto que esta en la mesa
- separar cuenta en una mesa
- crear un cliente si no esta registrado
- activar/desactivar factura electronica al momenta de facturar la cuenta
- reimprimir comanda de cocina
- ver todas las facturas de esa mesa
- crear una caja para hacer arqueo de caja
- ver informes de ventas

5. modulo de nomina

- crear, editar, eliminar y/o desactivar empleados
- crear turnos para llevar control de entrada y salidas
- asignar valor a turnos y roles de los empleados (cocinero, ayudante, mesero, cajero, administrdor)
- procesar informacion para liquidar nomina por rango de fechas
- generar soporte con desglose de pago
- debe gestionar abonos, creditos y descuentos a empleados

6. modulo de reportes y configuraciones

- generar dashboard de toda la imforacion que se pueda cruzar y sacar de la bbdd
- debe permitir exportar a excel o pdf

7. modulo de gastos

- gestionar gastos administrativos
- gasto de nomina
- gasto en proveedores

#Notas

- adjunto capturas de pantalla de software que uso actualmente
- sugiereme arquitecrura backend y frontend
- quiero basarme el proyecto bajo eventos push y pub para sincronizar la informacion
- el software puede ser standalone, es decir, que si el dueño de restaurante quiere usar una nube
- usar arquitectura hexagonal, clean arquitecture o similiares
- usar tecnologias como nextjs, electronjs, nestjs, postgres, librerias o servicios en aws para eventos sin consumir tantos recursos
- para el despligue de aplicaciones usar infraestructura como codigo

#Consideraciones

- realiza un plan detallado para la arquitectura de bbdd, eventos, backend y frontend
- no inventes nada, pregunta antes de tomar una decision, no siempre tengo los recursos economicos y conocimientos en el tema
- el proyecto debe ser escalable y en busca de un mvp lo mas pronto posible
- voy a usar github copilot para acelear el proceso de construccion del software

#Sugerencias

- Sugiereme un modelo de acuerdo a lo que necesita pequeños restaurantes que no esten sistematizados
- sugiereme un modelo de suscripcion para dueños de restaurantes
- sugiereme ideas para adicionar al software
