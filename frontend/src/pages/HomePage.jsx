import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarCheck,
  Eye,
  Home,
  KeyRound,
  MapPin,
  Search,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";

export default function HomePage({ compact = false }) {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const submit = (event) => {
    event.preventDefault();
    navigate(`/properties?search=${encodeURIComponent(search)}`);
  };
  if (compact)
    return (
      <section className="page-section narrow">
        <span className="eyebrow">How EchoDwell works</span>
        <h1>A clearer path from search to inspection.</h1>
        <div className="steps">
          <article>
            <b>01</b>
            <h3>Search transparently</h3>
            <p>
              Compare available homes, real charges and verified management
              details.
            </p>
          </article>
          <article>
            <b>02</b>
            <h3>Talk securely</h3>
            <p>
              Message the owner or authorized agent without leaving EchoDwell.
            </p>
          </article>
          <article>
            <b>03</b>
            <h3>Inspect first</h3>
            <p>
              Agree on a free inspection time before making a rental decision.
            </p>
          </article>
        </div>
      </section>
    );
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">
            <BadgeCheck size={16} /> Verified rental discovery
          </span>
          <h1>Find a place that feels right—and know who listed it.</h1>
          <p>
            Search available homes around you, understand every fee, and arrange
            an inspection directly with verified owners and authorized agents.
          </p>
          <form className="hero-search" onSubmit={submit}>
            <Search />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Damaturu, Nayi Nawa, Yobe…"
            />
            <button>Search homes</button>
          </form>
          <div className="hero-links">
            <Link to="/properties">
              Explore listings <ArrowRight size={17} />
            </Link>
            <Link to="/register">List your property</Link>
          </div>
        </div>
        <div className="hero-visual">
          <img
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=85"
            alt="Modern residential home"
          />
          <div className="floating-card">
            <ShieldCheck />
            <div>
              <strong>Clear verification</strong>
              <span>Know who owns and manages each listing.</span>
            </div>
          </div>
        </div>
      </section>
      <section className="trust-strip">
        <div>
          <Building2 />
          <strong>Properties with real availability</strong>
        </div>
        <div>
          <MapPin />
          <strong>Search close to your live location</strong>
        </div>
        <div>
          <ShieldCheck />
          <strong>Owner and agent accountability</strong>
        </div>
      </section>
      <section className="home-section">
        <div className="section-heading">
          <span className="eyebrow">Built for the real rental journey</span>
          <h2>From searching to inspecting, everything stays clear.</h2>
          <p>
            EchoDwell brings property availability, complete charges and trusted
            communication into one organised process.
          </p>
        </div>
        <div className="feature-grid">
          <article>
            <div className="feature-icon">
              <MapPin />
            </div>
            <h3>Nearby discovery</h3>
            <p>
              Use your live location to see available properties closest to you,
              ordered by real distance.
            </p>
          </article>
          <article>
            <div className="feature-icon">
              <Eye />
            </div>
            <h3>Transparent costs</h3>
            <p>
              See rent, agency, caution, legal and service charges before
              starting a conversation.
            </p>
          </article>
          <article>
            <div className="feature-icon">
              <CalendarCheck />
            </div>
            <h3>Free inspections</h3>
            <p>
              Propose a time, agree with the owner or agent and track the
              inspection from your account.
            </p>
          </article>
        </div>
      </section>
      <section className="owner-section">
        <div className="owner-image">
          <img
            src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=85"
            alt="Property owner reviewing a home"
          />
        </div>
        <div className="owner-copy">
          <span className="eyebrow">For owners and agencies</span>
          <h2>One place to manage every property and enquiry.</h2>
          <p>
            Create compounds with multiple units, assign authorised agents,
            receive enquiries and keep availability accurate without repeating
            the same property information.
          </p>
          <ul>
            <li>
              <BadgeCheck />
              Clear owner and agent verification
            </li>
            <li>
              <Building2 />
              Compound and apartment-unit management
            </li>
            <li>
              <KeyRound />
              Activation includes your first month
            </li>
          </ul>
          <Link className="button" to="/register">
            Start listing properties <ArrowRight size={17} />
          </Link>
        </div>
      </section>
      <section className="process-section">
        <div className="section-heading">
          <span className="eyebrow">A safer process</span>
          <h2>Do not pay rent from pictures alone.</h2>
        </div>
        <div className="process-track">
          {[
            ["01", Search, "Find a suitable home"],
            ["02", ShieldCheck, "Chat with the verified manager"],
            ["03", CalendarCheck, "Arrange a free inspection"],
            ["04", Home, "Confirm only after inspection"],
          ].map(([number, Icon, label]) => (
            <article key={number}>
              <span>{number}</span>
              <Icon />
              <strong>{label}</strong>
            </article>
          ))}
        </div>
      </section>
      <section className="home-cta">
        <div>
          <span className="eyebrow">Your next place can start here</span>
          <h2>Search confidently. List responsibly.</h2>
        </div>
        <div>
          <Link className="button light" to="/properties">
            Find a home
          </Link>
          <Link className="button outline" to="/register">
            List a property
          </Link>
        </div>
      </section>
    </>
  );
}
