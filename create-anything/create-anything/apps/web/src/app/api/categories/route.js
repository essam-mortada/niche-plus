import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const categories = await sql`
      SELECT * FROM ad_categories 
      WHERE deleted_at IS NULL
      ORDER BY name ASC
    `;

    return Response.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return Response.json(
      { error: "Failed to fetch categories" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const { name, description } = await request.json();

    if (!name) {
      return Response.json({ error: "Name is required" }, { status: 400 });
    }

    const [category] = await sql`
      INSERT INTO ad_categories (name, description, created_at)
      VALUES (${name}, ${description}, CURRENT_TIMESTAMP)
      RETURNING *
    `;

    return Response.json(category);
  } catch (error) {
    console.error("Error creating category:", error);
    return Response.json(
      { error: "Failed to create category" },
      { status: 500 },
    );
  }
}
