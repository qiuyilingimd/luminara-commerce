extends Node3D

var camera: Camera3D
var world: Node3D
var products: Array[Dictionary] = []
var pedestals: Array[MeshInstance3D] = []
var target_distance := 8.6
var distance := 11.5
var yaw := -0.16
var target_yaw := -0.16
var pitch := 0.02
var target_pitch := 0.02
var dragging := false
var interacted_at := -100.0
var elapsed := 0.0
var ready_posted := false
var touch_positions: Dictionary = {}
var touch_span := 0.0


func _ready() -> void:
	_build_environment()
	_build_stage()
	_build_products()
	camera = Camera3D.new()
	camera.fov = 39.0
	camera.near = 0.1
	camera.far = 80.0
	add_child(camera)
	_update_camera()
	_resize_layout()
	get_viewport().size_changed.connect(_resize_layout)
	_post_to_parent("luminara-godot-loading")
	create_tween().tween_property(self, "distance", target_distance, 2.2).set_trans(Tween.TRANS_QUINT).set_ease(Tween.EASE_OUT)
	await get_tree().process_frame
	await get_tree().process_frame
	_post_to_parent("luminara-godot-ready")
	ready_posted = true


func _build_environment() -> void:
	var environment := Environment.new()
	environment.background_mode = Environment.BG_COLOR
	environment.background_color = Color(0.003, 0.0025, 0.002)
	environment.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	environment.ambient_light_color = Color("#867867")
	environment.ambient_light_energy = 0.18
	environment.tonemap_mode = Environment.TONE_MAPPER_ACES
	environment.tonemap_exposure = 0.86
	environment.glow_enabled = false
	environment.fog_enabled = false
	environment.fog_light_color = Color("#0a0908")
	environment.fog_density = 0.012
	var world_environment := WorldEnvironment.new()
	world_environment.environment = environment
	add_child(world_environment)


func _build_stage() -> void:
	world = Node3D.new()
	world.name = "Gallery"
	add_child(world)

	var backdrop_material := StandardMaterial3D.new()
	backdrop_material.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	backdrop_material.albedo_texture = load("res://textures/backdrop.png")
	var backdrop := MeshInstance3D.new()
	var backdrop_mesh := QuadMesh.new()
	backdrop_mesh.size = Vector2(21, 11.8)
	backdrop.mesh = backdrop_mesh
	backdrop.material_override = backdrop_material
	backdrop_material.albedo_color = Color(0.008, 0.007, 0.006, 1.0)
	backdrop.position = Vector3(0, 0.15, -4.2)
	world.add_child(backdrop)

	var floor_material := StandardMaterial3D.new()
	floor_material.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	floor_material.albedo_color = Color(0.004, 0.0035, 0.003)
	var floor := MeshInstance3D.new()
	var floor_mesh := PlaneMesh.new()
	floor_mesh.size = Vector2(24, 18)
	floor.mesh = floor_mesh
	floor.material_override = floor_material
	floor.rotation.x = -PI / 2.0
	floor.position = Vector3(0, -2.05, 0.4)
	world.add_child(floor)

	var plinth_material := StandardMaterial3D.new()
	plinth_material.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	plinth_material.albedo_color = Color(0.012, 0.01, 0.008)
	for data in [
		[Vector3(0, -1.65, -0.5), Vector3(2.9, 0.22, 1.6)],
		[Vector3(-2.75, -1.7, -0.9), Vector3(1.85, 0.16, 1.15)],
		[Vector3(2.75, -1.7, -0.9), Vector3(1.85, 0.16, 1.15)]
	]:
		var plinth := MeshInstance3D.new()
		var plinth_mesh := BoxMesh.new()
		plinth_mesh.size = data[1]
		plinth.mesh = plinth_mesh
		plinth.material_override = plinth_material
		plinth.position = data[0]
		world.add_child(plinth)
		pedestals.append(plinth)

	var key := OmniLight3D.new()
	key.light_color = Color("#f0dcc1")
	key.light_energy = 1.7
	key.omni_range = 9.0
	key.position = Vector3(3.2, 4.6, 4.2)
	world.add_child(key)

	var rim := SpotLight3D.new()
	rim.light_color = Color("#c9b18e")
	rim.light_energy = 4.2
	rim.spot_range = 13.0
	rim.spot_angle = 31.0
	rim.position = Vector3(-3.2, 3.3, 2.0)
	world.add_child(rim)
	rim.look_at(Vector3(0, -0.5, 0), Vector3.UP)


func _product_material(path: String) -> StandardMaterial3D:
	var material := StandardMaterial3D.new()
	material.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	material.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	material.albedo_texture = load(path)
	material.texture_filter = BaseMaterial3D.TEXTURE_FILTER_LINEAR_WITH_MIPMAPS
	material.cull_mode = BaseMaterial3D.CULL_DISABLED
	return material


func _add_product(id: String, path: String, position: Vector3, size: Vector2, phase: float) -> void:
	var anchor := Node3D.new()
	anchor.name = id
	anchor.position = position
	world.add_child(anchor)

	var shadow := Sprite3D.new()
	shadow.texture = load("res://textures/shadow.png")
	shadow.pixel_size = 0.015
	shadow.modulate = Color(1, 1, 1, 0.72)
	shadow.position = Vector3(0, -size.y * 0.52, -0.08)
	shadow.scale = Vector3(size.x * 1.2, size.y * 0.28, 1)
	anchor.add_child(shadow)

	var halo := Sprite3D.new()
	halo.texture = load("res://textures/halo.png")
	halo.pixel_size = 0.012
	halo.modulate = Color(1, 1, 1, 0.85)
	halo.position = Vector3(0, 0, -0.16)
	halo.scale = Vector3(size.x * 1.9, size.y * 1.8, 1)
	anchor.add_child(halo)

	var product := MeshInstance3D.new()
	var mesh := QuadMesh.new()
	mesh.size = size
	product.mesh = mesh
	product.material_override = _product_material(path)
	anchor.add_child(product)

	products.append({
		"id": id,
		"node": anchor,
		"base_y": position.y,
		"phase": phase
	})


func _build_products() -> void:
	_add_product("pearl-hour", "res://products/pearl-hour.png", Vector3(0.15, -0.05, 0.25), Vector2(2.65, 3.31), 0.0)
	_add_product("serpentine", "res://products/serpentine.png", Vector3(-2.7, -0.76, -0.35), Vector2(1.72, 2.22), 1.8)
	_add_product("two-doves", "res://products/doves.png", Vector3(2.72, -0.72, -0.28), Vector2(2.12, 2.48), 3.2)
	_add_product("coral", "res://products/coral.png", Vector3(-4.1, -1.24, -0.9), Vector2(1.2, 1.46), 4.4)


func _resize_layout() -> void:
	if not camera:
		return
	var size := get_viewport().get_visible_rect().size
	var portrait := size.y > size.x * 1.12
	target_distance = 9.8 if portrait else 8.6
	if elapsed < 2.3:
		distance = max(distance, target_distance)
	for product in products:
		var anchor: Node3D = product.node
		var base_scale := 0.65 if portrait else 1.0
		if portrait:
			if product.id == "pearl-hour":
				anchor.position = Vector3(0, 0.25, 0.15)
			elif product.id == "serpentine":
				anchor.position = Vector3(-1.02, -0.78, -0.28)
			elif product.id == "two-doves":
				anchor.position = Vector3(1.02, -0.78, -0.26)
			else:
				anchor.position = Vector3(-1.34, -1.24, -0.48)
			anchor.visible = product.id != "coral"
		else:
			anchor.visible = true
			if product.id == "pearl-hour":
				anchor.position = Vector3(0.15, -0.05, 0.25)
			elif product.id == "serpentine":
				anchor.position = Vector3(-2.7, -0.76, -0.35)
			elif product.id == "two-doves":
				anchor.position = Vector3(2.72, -0.72, -0.28)
			else:
				anchor.position = Vector3(-3.7, -1.24, -0.9)
		product.base_y = anchor.position.y
		anchor.scale = Vector3.ONE * base_scale
	if pedestals.size() == 3:
		if portrait:
			pedestals[0].position = Vector3(0, -1.64, -0.22)
			pedestals[0].scale = Vector3(0.92, 1, 1)
			pedestals[1].position = Vector3(-1.02, -1.72, -0.45)
			pedestals[1].scale = Vector3(0.68, 1, 0.9)
			pedestals[2].position = Vector3(1.02, -1.72, -0.45)
			pedestals[2].scale = Vector3(0.68, 1, 0.9)
		else:
			pedestals[0].position = Vector3(0, -1.65, -0.5)
			pedestals[0].scale = Vector3.ONE
			pedestals[1].position = Vector3(-2.75, -1.7, -0.9)
			pedestals[1].scale = Vector3.ONE
			pedestals[2].position = Vector3(2.75, -1.7, -0.9)
			pedestals[2].scale = Vector3.ONE


func _update_camera() -> void:
	if not camera:
		return
	camera.position = Vector3(
		sin(yaw) * distance,
		0.45 + sin(pitch) * distance,
		cos(yaw) * distance
	)
	camera.look_at(Vector3(0, -0.25, 0), Vector3.UP)


func _process(delta: float) -> void:
	elapsed += delta
	if not dragging and elapsed - interacted_at > 1.8:
		target_yaw = -0.16 + sin(elapsed * 0.28) * 0.055
		target_pitch = 0.02 + sin(elapsed * 0.19) * 0.018
	yaw = lerpf(yaw, target_yaw, min(1.0, delta * 2.4))
	pitch = lerpf(pitch, target_pitch, min(1.0, delta * 2.4))
	distance = lerpf(distance, target_distance, min(1.0, delta * 1.8))
	for product in products:
		var anchor: Node3D = product.node
		anchor.position.y = product.base_y + sin(elapsed * 0.55 + product.phase) * 0.045
	_update_camera()


func _input(event: InputEvent) -> void:
	if event is InputEventMouseButton:
		if event.button_index == MOUSE_BUTTON_LEFT:
			dragging = event.pressed
			interacted_at = elapsed
		elif event.button_index == MOUSE_BUTTON_WHEEL_UP and event.pressed:
			target_distance = max(6.2, target_distance - 0.45)
			interacted_at = elapsed
		elif event.button_index == MOUSE_BUTTON_WHEEL_DOWN and event.pressed:
			target_distance = min(12.6, target_distance + 0.45)
			interacted_at = elapsed
	elif event is InputEventMouseMotion and dragging:
		target_yaw = clamp(target_yaw - event.relative.x * 0.005, -0.32, 0.2)
		target_pitch = clamp(target_pitch + event.relative.y * 0.003, -0.13, 0.16)
		interacted_at = elapsed


func _unhandled_input(event: InputEvent) -> void:
	if event.is_action_pressed("ui_cancel"):
		_post_to_parent("luminara-godot-close")
	elif event is InputEventScreenDrag:
		touch_positions[event.index] = event.position
		if touch_positions.size() >= 2:
			var points := touch_positions.values()
			var span: float = points[0].distance_to(points[1])
			if touch_span > 0.0:
				target_distance = clamp(target_distance - (span - touch_span) * 0.018, 6.2, 12.6)
			touch_span = span
		else:
			target_yaw = clamp(target_yaw - event.relative.x * 0.005, -0.32, 0.2)
			target_pitch = clamp(target_pitch + event.relative.y * 0.003, -0.13, 0.16)
		interacted_at = elapsed
	elif event is InputEventScreenTouch:
		if event.pressed:
			touch_positions[event.index] = event.position
		else:
			touch_positions.erase(event.index)
		touch_span = 0.0
		if touch_positions.size() == 2:
			var points := touch_positions.values()
			touch_span = points[0].distance_to(points[1])
		interacted_at = elapsed
	elif event is InputEventMagnifyGesture:
		target_distance = clamp(target_distance / event.factor, 6.2, 12.6)
		interacted_at = elapsed


func _post_to_parent(message: String) -> void:
	if OS.has_feature("web"):
		var window: JavaScriptObject = JavaScriptBridge.get_interface("window")
		window.parent.postMessage(message, "*")
