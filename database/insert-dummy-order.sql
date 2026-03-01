-- Find a user to assign the order to (change 'admin@dstore.lk' to your regular test email if preferred)
DO $$
DECLARE
    target_user_id UUID;
    new_order_id orders.id%TYPE;
    product_1_id RECORD;
    product_2_id RECORD;
BEGIN
    -- Get your user ID
    SELECT id INTO target_user_id FROM auth.users WHERE email = 'smcenterprises7@gmail.com' LIMIT 1;
    
    -- Ensure we have a user
    IF target_user_id IS NULL THEN
        RAISE EXCEPTION 'User not found. Please update the email in the script.';
    END IF;

    -- Get two unique products safely keeping their exact type
    SELECT id INTO product_1_id FROM products LIMIT 1;
    SELECT id INTO product_2_id FROM products WHERE id != product_1_id.id LIMIT 1;

    -- Insert the Order
    INSERT INTO orders (
        user_id, status, total_amount, shipping_cost, shipping_address, city, province, postal_code, phone, payment_method
    ) VALUES (
        target_user_id, 'delivered', 8500.00, 500.00, '{"street": "123 Fake Street, Apartment 4B"}'::jsonb, 'Colombo', 'Western', '00100', '+94 77 123 4567', 'payhere'
    ) RETURNING id INTO new_order_id;

    -- Insert Order Items
    IF product_1_id.id IS NOT NULL THEN
        INSERT INTO order_items (order_id, product_id, quantity, price, price_at_time)
        VALUES (new_order_id, product_1_id.id, 2, 2500.00, 2500.00);
    END IF;

    IF product_2_id.id IS NOT NULL THEN
        INSERT INTO order_items (order_id, product_id, quantity, price, price_at_time)
        VALUES (new_order_id, product_2_id.id, 1, 3000.00, 3000.00);
    END IF;

    RAISE NOTICE 'Dummy order successfully created for user: %', target_user_id;
END $$;
