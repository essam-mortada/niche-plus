import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status");
    const sortBy = searchParams.get("sortBy") || "event_date";
    const sortOrder = searchParams.get("sortOrder") || "DESC";

    const offset = (page - 1) * limit;

    // Build where clause
    let whereConditions = ["deleted_at IS NULL"]; // Soft delete filter
    let queryParams = [];
    let paramIndex = 1;

    if (search) {
      whereConditions.push(`(
        LOWER(title) LIKE LOWER($${paramIndex}) OR
        LOWER(description) LIKE LOWER($${paramIndex}) OR
        LOWER(location) LIKE LOWER($${paramIndex})
      )`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    if (status) {
      whereConditions.push(`status = $${paramIndex}`);
      queryParams.push(status);
      paramIndex++;
    }

    const whereClause = `WHERE ${whereConditions.join(" AND ")}`;

    // Get awards
    const awardsQuery = `
      SELECT *
      FROM awards
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(limit, offset);

    const awards = await sql(awardsQuery, queryParams);

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM awards
      ${whereClause}
    `;

    const [{ total }] = await sql(countQuery, queryParams.slice(0, -2));

    return Response.json({
      awards,
      pagination: {
        page,
        limit,
        total: parseInt(total),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching awards:", error);
    return Response.json({ error: "Failed to fetch awards" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const {
      title,
      description,
      location,
      event_date,
      image,
      status = "upcoming",
    } = await request.json();

    if (!title || !location || !event_date) {
      return Response.json(
        { error: "Title, location, and event date are required" },
        { status: 400 },
      );
    }

    const [award] = await sql`
      INSERT INTO awards (title, description, location, event_date, image, status)
      VALUES (${title}, ${description}, ${location}, ${event_date}, ${image}, ${status})
      RETURNING *
    `;

    return Response.json(award);
  } catch (error) {
    console.error("Error creating award:", error);
    return Response.json({ error: "Failed to create award" }, { status: 500 });
  }
}
