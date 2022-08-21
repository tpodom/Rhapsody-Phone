const searchMock = vi.fn();
const documentsMock = vi.fn(() => ({ search: searchMock }));
const collectionsMock = vi.fn(() => ({ documents: documentsMock }));
const mockClient = vi.fn();
mockClient.prototype.collections = collectionsMock;

vi.mock("typesense", () => {
  return {
    Client: mockClient,
  };
});

import { describe, expect, it, vi } from "vitest";
import { query } from "../search";

describe("client search", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should return segment with single space", async () => {
    const typesense = await import("typesense");
    searchMock.mockResolvedValue({
      facet_counts: [],
      found: 1,
      hits: [
        {
          document: {
            home_phone_number: null,
            id: "1L5GbGXE",
            mobile_phone_number: "",
            name: "Bob Smith",
            other_phone_number: null,
            phone_number: [],
            timestamp: 1657502418,
            work_phone_number: null,
          },
          highlights: [
            {
              field: "name",
              matched_tokens: ["Bob", "Smith"],
              snippet: "<mark>Bob</mark> <mark>Smith</mark>",
            },
          ],
          text_match: 144681433930203137,
        },
      ],
      out_of: 6,
      page: 1,
      request_params: { collection_name: "clients", per_page: 10, q: "bob smith" },
      search_cutoff: false,
      search_time_ms: 0,
    });

    const result = await query("clients", { q: "Bob Smith", query_by: "name" });

    expect(result.hits.length).toEqual(1);
    expect(result.hits[0].highlights.length).toEqual(1);
    expect(result.hits[0].highlights[0].field).toEqual("name");
    expect(result.hits[0].highlights[0].segments.length).toEqual(3);
    expect(result.hits[0].highlights[0].segments[0]).toMatchObject({
      match: true,
      text: "Bob",
    });
    expect(result.hits[0].highlights[0].segments[1]).toMatchObject({
      match: false,
      text: " ",
    });
    expect(result.hits[0].highlights[0].segments[2]).toMatchObject({
      match: true,
      text: "Smith",
    });
  });

  it("should return segment with initial block matched", async () => {
    const typesense = await import("typesense");
    searchMock.mockResolvedValue({
      facet_counts: [],
      found: 1,
      hits: [
        {
          document: {
            home_phone_number: null,
            id: "1L5GbGXE",
            mobile_phone_number: "",
            name: "Bob Smith",
            other_phone_number: null,
            phone_number: [],
            timestamp: 1657502418,
            work_phone_number: null,
          },
          highlights: [
            {
              field: "name",
              matched_tokens: ["Bob"],
              snippet: "<mark>Bob</mark> Smith",
            },
          ],
          text_match: 144681433930203137,
        },
      ],
      out_of: 6,
      page: 1,
      request_params: { collection_name: "clients", per_page: 10, q: "bob" },
      search_cutoff: false,
      search_time_ms: 0,
    });

    const result = await query("clients", { q: "Bob", query_by: "name" });

    expect(result.hits.length).toEqual(1);
    expect(result.hits[0].highlights.length).toEqual(1);
    expect(result.hits[0].highlights[0].field).toEqual("name");
    expect(result.hits[0].highlights[0].segments.length).toEqual(2);
    expect(result.hits[0].highlights[0].segments[0]).toMatchObject({
      match: true,
      text: "Bob",
    });
    expect(result.hits[0].highlights[0].segments[1]).toMatchObject({
      match: false,
      text: " Smith",
    });
  });

  it("should return segment with second block matched", async () => {
    const typesense = await import("typesense");
    searchMock.mockResolvedValue({
      facet_counts: [],
      found: 1,
      hits: [
        {
          document: {
            home_phone_number: null,
            id: "1L5GbGXE",
            mobile_phone_number: "",
            name: "Bob Smith",
            other_phone_number: null,
            phone_number: [],
            timestamp: 1657502418,
            work_phone_number: null,
          },
          highlights: [
            {
              field: "name",
              matched_tokens: ["Smith"],
              snippet: "Bob <mark>Smith</mark>",
            },
          ],
          text_match: 144681433930203137,
        },
      ],
      out_of: 6,
      page: 1,
      request_params: { collection_name: "clients", per_page: 10, q: "smith" },
      search_cutoff: false,
      search_time_ms: 0,
    });

    const result = await query("clients", { q: "Smith", query_by: "name" });

    expect(result.hits.length).toEqual(1);
    expect(result.hits[0].highlights.length).toEqual(1);
    expect(result.hits[0].highlights[0].field).toEqual("name");
    expect(result.hits[0].highlights[0].segments.length).toEqual(2);
    expect(result.hits[0].highlights[0].segments[0]).toMatchObject({
      match: false,
      text: "Bob ",
    });
    expect(result.hits[0].highlights[0].segments[1]).toMatchObject({
      match: true,
      text: "Smith",
    });
  });
});
